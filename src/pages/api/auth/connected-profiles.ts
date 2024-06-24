import type { NextApiRequest, NextApiResponse } from 'next';
import { youtubeMediaTable, linkedinMediaTable, twitterMediaTable } from '@/db/schemes';
import { db } from '@/db/db';
import { getAuth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { verifyUser } from '@/utils/users';

/**
 * @swagger
 * api/auth/connected-profiles:
 *   get:
 *     summary: Get social media profiles of a user
 *     description: Returns the social media profiles associated with the authenticated user.
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Successfully retrieved social media profiles.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profiles:
 *                   type: object
 *                   properties:
 *                     twitter:
 *                       type: object
 *                       properties:
 *                         username:
 *                           type: string
 *                           example: "twitter_user"
 *                         url:
 *                           type: string
 *                           example: "https://twitter.com/twitter_user"
 *                         picture:
 *                           type: string
 *                           example: "https://twitter.com/twitter_user/profile_pic.jpg"
 *                     linkedin:
 *                       type: object
 *                       properties:
 *                         username:
 *                           type: string
 *                           example: "linkedin_user"
 *                         date:
 *                           type: string
 *                           example: "2023-01-01"
 *                         picture:
 *                           type: string
 *                           example: "https://linkedin.com/linkedin_user/profile_pic.jpg"
 *                     youtube:
 *                       type: object
 *                       properties:
 *                         username:
 *                           type: string
 *                           example: "youtube_user"
 *                         url:
 *                           type: string
 *                           example: "https://youtube.com/youtube_user"
 *                         picture:
 *                           type: string
 *                           example: "https://youtube.com/youtube_user/profile_pic.jpg"
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
 *         description: Social media account not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Social media account not found"
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

    if(!verifyUser(userId)) {
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
            date: linkedinMedia[0].tokenExpiration?.toString() ?? null,
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