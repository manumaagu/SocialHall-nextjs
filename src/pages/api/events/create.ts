import { NextApiRequest, NextApiResponse } from 'next';
import { InsertEvent, eventTable } from '@/db/schemes';
import { db } from '@/db/db';
import { randomBytes } from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const { userId, socialMedia, pendingId, date, content } = req.body;

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