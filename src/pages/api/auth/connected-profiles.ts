// pages/api/linkedin/callback.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { randomBytes } from 'crypto';
import { youtubeMediaTable, linkedinMediaTable, twitterMediaTable, usersTable } from '@/db/schemes';
import { db } from '@/db/db';
import { getAuth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(400).json({ error: "Clerk user id missing" });
    }

    const dbUser = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId));

    if (!dbUser[0] || dbUser.length !== 1) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    let profiles: {
        twitter?: { username: string | null; url: string | null; picture: string | null; },
        linkedin?: { username: string | null; date: string | null; picture: string | null; },
        facebook?: { username: string | null; url: string | null; picture: string | null; },
        instagram?: { username: string | null; url: string | null; picture: string | null; },
        tiktok?: { username: string | null; url: string | null; picture: string | null; },
        youtube?: { username: string | null; url: string | null; picture: string | null; },
    } = {
        twitter: undefined,
        linkedin: undefined,
        facebook: undefined,
        instagram: undefined,
        tiktok: undefined,
        youtube: undefined,
    };

    const twitterMedia = await db.select().from(twitterMediaTable).where(eq(twitterMediaTable.clerkId, userId));

    if (twitterMedia && twitterMedia.length > 0) {
        profiles.twitter = {
            username: twitterMedia[0].profile_username,
            url: twitterMedia[0].profile_url,
            picture: twitterMedia[0].profile_picture,
        }
    }

    const linkedinMedia = await db.select().from(linkedinMediaTable).where(eq(linkedinMediaTable.clerkId, userId));

    if (linkedinMedia && linkedinMedia.length > 0) {
        profiles.linkedin = {
            username: linkedinMedia[0].profile_username,
            date: linkedinMedia[0].date,
            picture: linkedinMedia[0].profile_picture,
        }
    }

    const youtubeMedia = await db.select().from(youtubeMediaTable).where(eq(youtubeMediaTable.clerkId, userId));

    if (youtubeMedia && youtubeMedia.length > 0) {
        profiles.youtube = {
            username: youtubeMedia[0].profile_username,
            url: youtubeMedia[0].profile_url,
            picture: youtubeMedia[0].profile_picture,
        }
    }

    res.json({
        profiles: profiles,
    });
}