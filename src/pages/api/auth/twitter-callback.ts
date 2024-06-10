// pages/api/linkedin/callback.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { randomBytes } from 'crypto';
import { InsertTwitterMedia, twitterMediaTable } from '@/db/schemes';
import { db } from '@/db/db';
import { LinkedinMedia } from '@/models/media-linkedin';
import { getAuth } from '@clerk/nextjs/server';
import { asc, count, eq, getTableColumns, gt, sql } from 'drizzle-orm';
import NodeCache from 'node-cache';
import { TwitterApi } from 'twitter-api-v2';

const cache = new NodeCache();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { state, code } = req.query;

    const codeVerifier: string = cache.get("codeVerifier") as string;
    const stateCache = cache.get("state");

    if (!codeVerifier || !state || !stateCache || !code) {
        return res.status(400).send('You denied the app or your session expired!');
    }
    if (state !== stateCache) {
        return res.status(400).send('Stored tokens did not match!');
    }

    const client = new TwitterApi({ clientId: process.env.TWITTER_CLIENT_ID as string, clientSecret: process.env.TWITTER_CLIENT_SECRET as string });

    client.loginWithOAuth2({ code: code.toString(), codeVerifier, redirectUri: process.env.TWITTER_CALLBACK_URL as string })
        .then(async ({ client: loggedClient, accessToken, refreshToken, expiresIn }) => {
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
                profile_followers: JSON.stringify(followArray),
            };

            await db.insert(twitterMediaTable).values(twitterMedia);

            res.redirect('http://localhost:3000/');
        })
        .catch(() => res.status(403).send('Invalid verifier or access tokens!'));
}