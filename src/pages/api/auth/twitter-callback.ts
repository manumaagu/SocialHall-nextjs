// pages/api/linkedin/callback.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { randomBytes } from 'crypto';
import { InsertTwitterMedia, twitterMediaTable, usersTable } from '@/db/schemes';
import { db } from '@/db/db';
import { getAuth } from '@clerk/nextjs/server';
import { TwitterApi } from 'twitter-api-v2';
import { SelectTemporaryTokens, temporaryTokensTable } from '@/db/schemes';
import { eq } from 'drizzle-orm';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(400).json({ error: "Clerk user id missing" });
    }

    const dbUser = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId));

    if (!dbUser[0] || dbUser.length !== 1) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { state, code, error } = req.query;

    if (error) {
        res.redirect('http://localhost:3000/');
        return;
    }

    let temporaryTokens = await db.select().from(temporaryTokensTable).where(eq(temporaryTokensTable.id, userId));

    const codeVerifier = temporaryTokens[0].codeVerifier;
    const sessionState = temporaryTokens[0].state;

    if (!codeVerifier || !state || !sessionState || !code) {
        return res.status(400).send('You denied the app or your session expired!');
    }
    if (state !== sessionState) {
        return res.status(400).send('Stored tokens did not match!');
    }

    try {
        const client = new TwitterApi({ clientId: process.env.TWITTER_CLIENT_ID as string, clientSecret: process.env.TWITTER_CLIENT_SECRET as string });

        const { client: loggedClient, accessToken, refreshToken, expiresIn } = await client.loginWithOAuth2({
            code: code.toString(),
            codeVerifier: codeVerifier.toString(),
            redirectUri: process.env.TWITTER_CALLBACK_URL as string
        });

        const { data: profile } = await loggedClient.v2.me({ "user.fields": ["profile_image_url", "public_metrics"] });

        const followObject = {
            "date": Date.now(),
            "count": profile.public_metrics?.followers_count,
        }

        const followArray = [followObject];

        const twitterMedia: InsertTwitterMedia = {
            id: randomBytes(16).toString("hex"),
            clerkId: userId,
            date: Date.now().toString(),
            tokenAccess: accessToken,
            tokenRefresh: refreshToken,
            tokenExpiration: Date.now() + expiresIn * 1000,
            profile_id: profile.id,
            profile_username: profile.username,
            profile_picture: profile.profile_image_url,
            profile_url: `https://twitter.com/${profile.username}`,
            profile_followers: JSON.stringify(followArray),
        };

        await db.insert(twitterMediaTable).values(twitterMedia);

        await db.delete(temporaryTokensTable).where(eq(temporaryTokensTable.id, userId));

        res.redirect('http://localhost:3000/');
    } catch (error) {
        console.error('Error logging in with OAuth2:', error);
        res.status(403).send('Invalid verifier or access tokens!');
    }
}
