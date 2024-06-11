import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from "@clerk/nextjs/server";
import { eq } from 'drizzle-orm';
import { youtubeMediaTable } from '@/db/schemes';
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
        return res.status(404).json({ error: "Twitter account not found" });
    }

    const media = youtubeMedia[0];

    const posts = JSON.parse(media.posts!) ?? [];
    const followers = JSON.parse(media.subscribers!) ?? [];

    const results = [];

    results.push({
        posts: posts,
        followers: followers
    });

    return res.status(200).json(results);

}