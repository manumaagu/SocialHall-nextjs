import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from "@clerk/nextjs/server";
import { eq } from 'drizzle-orm';
import { eventTable } from '@/db/schemes';
import { db } from '@/db/db';
import { verifyUser } from '@/utils/users';
import { socialMediaColor } from '@/utils/event';
import { timeToYear } from '@/utils/time';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

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