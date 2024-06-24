import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from "@clerk/nextjs/server";
import { eq } from 'drizzle-orm';
import { linkedinMediaTable } from '@/db/schemes';
import { db } from '@/db/db';
import { verifyUser } from '@/utils/users';


/**
 * @swagger
 * api/posts/list/linkedin:
 *   get:
 *     summary: Get LinkedIn media posts
 *     description: Retrieves LinkedIn media posts for the authenticated user.
 *     tags:
 *       - Posts
 *     responses:
 *       200:
 *         description: Successfully retrieved LinkedIn media posts.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   url:
 *                     type: string
 *       400:
 *         description: Missing Clerk user ID or bad request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Clerk user id missing"
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
 *         description: LinkedIn media not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "LinkedIn media not found"
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

    const linkedinMedia = await db.select().from(linkedinMediaTable).where(eq(linkedinMediaTable.clerkId, userId));

    if (linkedinMedia.length === 0) {
        return res.status(404).json({ error: "Linkedin account not found" });
    }

    const media = linkedinMedia[0];

    if (!media.posts) {
        res.status(404).json({ message: "No posts found" });
    }

    const posts = JSON.parse(media.posts!) ?? [];

    res.status(200).json(posts);

}