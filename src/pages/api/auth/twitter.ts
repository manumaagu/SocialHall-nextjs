import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from "@clerk/nextjs/server";
import { TwitterApi } from 'twitter-api-v2';
import { InsertTemporaryTokens, temporaryTokensTable } from '@/db/schemes';
import { db } from '@/db/db';
import { verifyUser } from '@/utils/users';

/**
 * @swagger
 * api/auth/twitter:
 *   get:
 *     summary: Get Twitter OAuth URL
 *     description: Returns the Twitter OAuth URL for the authenticated user to authorize the application.
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Successfully retrieved Twitter OAuth URL.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   example: "https://twitter.com/i/oauth2/authorize?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&state=state&scope=tweet.read%20tweet.write%20users.read%20offline.access"
 *       400:
 *         description: Missing Clerk user ID or bad request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Clerk user id missing"
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
 *       405:
 *         description: Method not allowed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Method not allowed"
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(400).json({ error: "Clerk user id missing" });
    }

    if (!verifyUser(userId)) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const client = new TwitterApi({ clientId: process.env.TWITTER_CLIENT_ID as string, clientSecret: process.env.TWITTER_CLIENT_SECRET as string });

    const scopes = ['tweet.read', 'tweet.write', 'users.read', 'offline.access'];

    const { url, codeVerifier, state } = client.generateOAuth2AuthLink(process.env.CLIENT_URL as string + process.env.TWITTER_CALLBACK_URL as string, { scope: scopes });

    const newTemporaryTokens: InsertTemporaryTokens = {
        clerkId: userId,
        codeVerifier: codeVerifier,
        state: state
    };

    await db.insert(temporaryTokensTable).values(newTemporaryTokens);

    return res.json({ url: url });
}