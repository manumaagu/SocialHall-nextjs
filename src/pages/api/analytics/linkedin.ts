import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from "@clerk/nextjs/server";
import { eq } from 'drizzle-orm';
import { linkedinMediaTable } from '@/db/schemes';
import { db } from '@/db/db';
import { verifyUser } from '@/utils/users';

/**
 * @swagger
 * api/analytics/linkedin:
 *   get:
 *     summary: Get LinkedIn statistics of a user
 *     description: Returns the posts and followers of the LinkedIn account associated with the authenticated user.
 *     tags:
 *     - Analytics
 *     responses:
 *       200:
 *         description: Successfully retrieved LinkedIn media.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   posts:
 *                     type: array
 *                     description: List of LinkedIn posts.
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "post123"
 *                         content:
 *                           type: string
 *                           example: "This is a LinkedIn post content."
 *                         date: 
 *                           type: number
 *                           example: 1723456789
 *                         statistics:
 *                           type: array
 *                           description: List of LinkedIn post statistics.
 *                           example: [{"date": 1723456789, "impressions": 5, "comments": 2, "likes": 3}]
 *                   followers:
 *                     type: array
 *                     description: List of LinkedIn followers.
 *                     items:
 *                       type: object
 *                       properties:
 *                         date:
 *                           type: number
 *                           example: 1723456789
 *                         count:
 *                           type: number
 *                           example: 123
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
 *         description: LinkedIn account not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "LinkedIn account not found"
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

    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(400).json({ error: "Clerk user id missing" });
    }

    if (!verifyUser(userId)) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const linkedinMedia = await db.select().from(linkedinMediaTable).where(eq(linkedinMediaTable.clerkId, userId));

    if (linkedinMedia.length === 0) {
        return res.status(404).json({ error: "Linkedin account not found" });
    }

    const media = linkedinMedia[0];

    const posts = JSON.parse(media.posts!) ?? [];
    const followers = JSON.parse(media.profile_followers!) ?? [];

    const results = [];

    results.push({
        posts: posts,
        followers: followers
    });

    return res.status(200).json(results);

}