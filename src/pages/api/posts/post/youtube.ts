import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from "@clerk/nextjs/server";
import { eq } from 'drizzle-orm';
import { youtubeMediaTable, InsertPendingYoutube, pendingYoutubeTable } from '@/db/schemes';
import { db } from '@/db/db';
import { randomBytes } from 'crypto';
import { verifyUser } from '@/utils/users';

/**
 * @swagger
 * api/posts/post/youtube:
 *   post:
 *     summary: Add Youtube content to pending queue
 *     description: Adds Youtube content to the pending queue for the authenticated user.
 *     tags:
 *       - Posts
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-01-01T00:00:00Z"
 *               content:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "This is a tweet"
 *     responses:
 *       200:
 *         description: Successfully added tweets to pending queue.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Youtube posts added to pending queue"
 *       400:
 *         description: Missing Clerk user ID or bad request.
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
 *       500:
 *         description: Internal server error, such as form parsing errors.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error parsing form data"
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

    const contentToSend = req.body;
    const postingDate = contentToSend.date;

    const pendingYoutube: InsertPendingYoutube = {
        id: randomBytes(16).toString('hex'),
        clerkId: userId,
        postingDate: postingDate,
        content: contentToSend,
    };

    await db.insert(pendingYoutubeTable).values(pendingYoutube);

    res.status(200).json({ message: "Youtube posts added to pending queue" });

}