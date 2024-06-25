import type { NextApiRequest, NextApiResponse } from 'next';
import { randomBytes } from 'crypto';
import { InsertTwitterMedia, twitterMediaTable } from '@/db/schemes';
import { db } from '@/db/db';
import { getAuth } from '@clerk/nextjs/server';
import { TwitterApi } from 'twitter-api-v2';
import { temporaryTokensTable } from '@/db/schemes';
import { eq } from 'drizzle-orm';
import { verifyUser } from '@/utils/users';

/**
 * @swagger
 * api/auth/twitter-callback:
 *   get:
 *     summary: Twitter OAuth Callback
 *     description: Handles the Twitter OAuth callback, exchanges the authorization code for an access token, and updates the user's Twitter media information.
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: query
 *         name: state
 *         required: false
 *         schema:
 *           type: string
 *         description: The state parameter returned by Twitter.
 *       - in: query
 *         name: code
 *         required: false
 *         schema:
 *           type: string
 *         description: The authorization code returned by Twitter.
 *       - in: query
 *         name: error
 *         required: false
 *         schema:
 *           type: string
 *         description: The error returned by Twitter, if any.
 *     responses:
 *       200:
 *         description: Successfully handled Twitter OAuth callback.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully handled Twitter OAuth callback"
 *       400:
 *         description: Missing Clerk user ID, state, code, or bad request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Clerk user id missing"
 *                 message:
 *                   type: string
 *                   example: "You denied the app or your session expired!"
 *       401:
 *         description: Unauthorized user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       403:
 *         description: Invalid verifier or access tokens.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid verifier or access tokens"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(400).json({ error: "Clerk user id missing" });
    }

    if (!verifyUser(userId)) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { state, code, error } = req.query;

    if (error) {
        res.redirect(process.env.CLIENT_URL as string);
        return;
    }

    let temporaryTokens = await db.select().from(temporaryTokensTable).where(eq(temporaryTokensTable.clerkId, userId));

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
            redirectUri: process.env.CLIENT_URL as string + process.env.TWITTER_CALLBACK_URL as string
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

        await db.delete(temporaryTokensTable).where(eq(temporaryTokensTable.clerkId, userId));

        res.redirect(process.env.CLIENT_URL as string);
    } catch (error) {
        console.error('Error logging in with OAuth2:', error);
        res.status(403).send('Invalid verifier or access tokens');
    }
}
