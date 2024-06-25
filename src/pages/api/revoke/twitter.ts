import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from "@clerk/nextjs/server";
import { eq } from 'drizzle-orm';
import { twitterMediaTable } from '@/db/schemes';
import { db } from '@/db/db';
import { TwitterApi } from 'twitter-api-v2';
import { verifyUser } from '@/utils/users';

/**
 * @swagger
 * api/revoke/twitter:
 *   post:
 *     summary: Revoke Twitter account for a user
 *     description: Deletes the Twitter account associated with the authenticated user.
 *     tags:
 *       - Revoke
 *     responses:
 *       200:
 *         description: Successfully revoked the Twitter account.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Account revoked"
 *       400:
 *         description: Missing Clerk user ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Clerk user ID missing"
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
 *       404:
 *         description: Twitter account not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Twitter account not found"
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

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(400).json({ error: "Clerk user id missing" });
    }

    if(!verifyUser(userId)) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const twitterMedia = await db.select().from(twitterMediaTable).where(eq(twitterMediaTable.clerkId, userId));

    if (twitterMedia.length === 0) {
        return res.status(404).json({ error: "Twitter account not found" });
    }

    let tokenAccess = twitterMedia[0].tokenAccess;
    let tokenRefresh = twitterMedia[0].tokenRefresh;
    let tokenExpiration = twitterMedia[0].tokenExpiration;
    let client = new TwitterApi({ clientId: process.env.TWITTER_CLIENT_ID as string });

    if (tokenExpiration && Date.now() >= tokenExpiration) {  // Token expired 
        client.revokeOAuth2Token(tokenRefresh!, 'refresh_token');
    }

    client.revokeOAuth2Token(tokenAccess!, 'access_token');

    console.log(`[TWITTER] Account revoked for user ${userId}`);

    await db.delete(twitterMediaTable).where(eq(twitterMediaTable.clerkId, userId));

    res.status(200).json({ message: "Account revoked" });
}