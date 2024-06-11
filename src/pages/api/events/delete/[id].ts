import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from "@clerk/nextjs/server";
import { eq } from 'drizzle-orm';
import { eventTable, pendingLinkedinTable, pendingTweetsTable, pendingYoutubeTable } from '@/db/schemes';
import { db } from '@/db/db';
import { verifyUser } from '@/utils/users';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(400).json({ error: "Clerk user id missing" });
    }

    if (!verifyUser(userId)) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { id: eventId } = req.query;

    const events = await db.select().from(eventTable).where(eq(eventTable.id, eventId?.toString() ?? ''));

    if (events.length === 0) {
        return res.status(404).json({ error: "Event not found" });
    }

    const event = events[0];

    if (event.clerkId !== userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (event.posted === 0) {
        switch (event.socialMedia?.toLowerCase()) {
            case 'twitter':
                await db.delete(pendingTweetsTable).where(eq(pendingTweetsTable.id, event.pendingId ?? ''));
                break;
            case 'linkedin':
                await db.delete(pendingLinkedinTable).where(eq(pendingLinkedinTable.id, event.pendingId ?? ''));
                break;
            case 'youtube':
                await db.delete(pendingYoutubeTable).where(eq(pendingYoutubeTable.id, event.pendingId ?? ''));
                break;
            default:
                break;
        }
    }

    await db.delete(eventTable).where(eq(eventTable.id, eventId?.toString() ?? ''));

    res.status(200).json({ message: "Event deleted" });
}