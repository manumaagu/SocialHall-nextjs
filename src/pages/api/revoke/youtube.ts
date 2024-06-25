import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from "@clerk/nextjs/server";
import { google } from 'googleapis';
import { eq } from 'drizzle-orm';
import { youtubeMediaTable } from '@/db/schemes';
import { db } from '@/db/db';
import { verifyUser } from '@/utils/users';

/**
 * @swagger
 * api/revoke/youtube:
 *   post:
 *     summary: Revoke Youtube account for a user
 *     description: Deletes the Youtube account associated with the authenticated user.
 *     tags:
 *       - Revoke
 *     responses:
 *       200:
 *         description: Successfully revoked the Youtube account.
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
 *         description: Youtube account not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Youtube account not found"
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

    if (!verifyUser(userId)) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const youtubeMedia = await db.select().from(youtubeMediaTable).where(eq(youtubeMediaTable.clerkId, userId));

    if (youtubeMedia.length === 0) {
        return res.status(404).json({ error: "Youtube account not found" });
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.CLIENT_URL as string + process.env.GOOGLE_CALLBACK_URL
    );

    oauth2Client.setCredentials({
        access_token: youtubeMedia[0].tokenAccess,
        refresh_token: youtubeMedia[0].tokenRefresh
    });

    if (youtubeMedia[0].tokenAccess) {
        oauth2Client.revokeToken(youtubeMedia[0].tokenAccess);
    }

    console.log(`[YOUTUBE] Account revoked for user ${userId}`);

    await db.delete(youtubeMediaTable).where(eq(youtubeMediaTable.clerkId, userId));

    res.status(200).json({ message: "Account revoked" });
}