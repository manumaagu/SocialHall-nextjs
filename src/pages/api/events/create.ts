import { NextApiRequest, NextApiResponse } from 'next';
import { InsertEvent, eventTable } from '@/db/schemes';
import { db } from '@/db/db';
import { randomBytes } from 'crypto';
import { verifyUser } from '@/utils/users';

/**
 * @swagger
 * api/events/create:
 *   post:
 *     summary: Create a new event for a user
 *     description: Creates a new event associated with the authenticated user.
 *     tags:
 *       - Events
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "user123"
 *               socialMedia:
 *                 type: string
 *                 example: "twitter"
 *               pendingId:
 *                 type: string
 *                 example: "pending123"
 *               date:
 *                 type: string
 *                 example: "2023-01-01T00:00:00Z"
 *               content:
 *                 type: string
 *                 example: "This is a sample event content."
 *     responses:
 *       200:
 *         description: Successfully created the event.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Event created"
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
 *       405:
 *         description: Method not allowed, use POST.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Method not allowed, use POST"
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if(req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed, use POST" });
    }

    const { userId, socialMedia, pendingId, date, content } = req.body;

    if (!userId) {
        return res.status(400).json({ error: "Clerk user id missing" });
    }

    if (!verifyUser(userId)) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const contentObject = {
        text: content,
    }

    const event: InsertEvent = {
        id: randomBytes(16).toString('hex'),
        clerkId: userId,
        socialMedia: socialMedia,
        pendingId: pendingId,
        date: date,
        posted: 0,
        content: JSON.stringify(contentObject),
    };

    await db.insert(eventTable).values(event);

    res.status(200).json({ message: "Event created" });
}