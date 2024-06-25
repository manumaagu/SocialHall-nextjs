import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from "@clerk/nextjs/server";
import { eq } from 'drizzle-orm';
import { eventTable } from '@/db/schemes';
import { db } from '@/db/db';
import { verifyUser } from '@/utils/users';
import { socialMediaColor } from '@/utils/event';
import { timeToYear } from '@/utils/time';

/**
 * @swagger
 * api/events/list:
 *   get:
 *     summary: Get events of a user
 *     description: Returns the events associated with the authenticated user.
 *     tags:
 *       - Events
 *     responses:
 *       200:
 *         description: Successfully retrieved events.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "event123"
 *                   title:
 *                     type: string
 *                     example: "Sample Event"
 *                   start:
 *                     type: string
 *                     example: "2023-01-01T00:00:00Z"
 *                   backgroundColor:
 *                     type: string
 *                     example: "#ff0000"
 *                   allDay:
 *                     type: boolean
 *                     example: false
 *                   editable:
 *                     type: boolean
 *                     example: false
 *                   className:
 *                     type: string
 *                     example: "event-facebook"
 *                   borderColor:
 *                     type: string
 *                     example: "green"
 *                   posted:
 *                     type: boolean
 *                     example: true
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
 *         description: Event not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Event not found"
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

    const events = await db.select().from(eventTable).where(eq(eventTable.clerkId, userId));

    if (events.length === 0) {
        return res.status(404).json({ error: "Event not found" });
    }

    let results: {
        id: string;
        title: string;
        start: string;
        backgroundColor: string;
        allDay: boolean;
        editable: boolean;
        className: string;
        borderColor?: string;
        posted: boolean;
    }[] = [];

    for (const event of events) {
        let borderColor = null;

        const posted = event.posted === 1 ? true : false;
        const eventContent = JSON.parse(event.content!);

        if (posted) {
            borderColor = "green";
        }

        results.push({
            id: event.id,
            title: eventContent.text,
            start: timeToYear(event.date),
            backgroundColor: socialMediaColor(event.socialMedia!),
            allDay: false,
            editable: false,
            className: "event-" + event.socialMedia!.toLowerCase(),
            borderColor: borderColor!,
            posted: posted
        });
    }

    res.json(results);
}