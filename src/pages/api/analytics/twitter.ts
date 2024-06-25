import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from "@clerk/nextjs/server";
import { eq } from 'drizzle-orm';
import { twitterMediaTable } from '@/db/schemes';
import { db } from '@/db/db';
import { verifyUser } from '@/utils/users';

/**
 * @swagger
 * api/analytics/twitter:
 *   get:
 *     summary: Get Twitter statistics of a user
 *     description: Returns the posts and followers of the Twitter account associated with the authenticated user.
 *     tags:
 *     - Analytics
 *     responses:
 *       200:
 *         description: Successfully retrieved Twitter media.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   posts:
 *                     type: array
 *                     description: List of Twitter posts.
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "post123"
 *                         content:
 *                           type: string
 *                           example: "This is a Twitter post content."
 *                         date: 
 *                           type: number
 *                           example: 1723456789
 *                         statistics:
 *                           type: array
 *                           description: List of Twitter post statistics.
 *                           example: [{"date": 1723456789, "impressions": 5, "comments": 2, "likes": 3}]
 *                   followers:
 *                     type: array
 *                     description: List of Twitter followers.
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
 *         description: Twitter account not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Twitter account not found"
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

    const twitterMedia = await db.select().from(twitterMediaTable).where(eq(twitterMediaTable.clerkId, userId));

    if (twitterMedia.length === 0) {
        return res.status(404).json({ error: "Twitter account not found" });
    }

    const media = twitterMedia[0];

    const posts = JSON.parse(media.posts!) ?? [];
    const followers = JSON.parse(media.profile_followers!) ?? [];

    const results = [];

    results.push({
        posts: posts,
        followers: followers
    });

    return res.status(200).json(results);

}