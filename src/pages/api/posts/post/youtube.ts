import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from "@clerk/nextjs/server";
import { eq } from 'drizzle-orm';
import { youtubeMediaTable, InsertPendingYoutube, pendingYoutubeTable } from '@/db/schemes';
import { db } from '@/db/db';
import { randomBytes } from 'crypto';
import { verifyUser } from '@/utils/users';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

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