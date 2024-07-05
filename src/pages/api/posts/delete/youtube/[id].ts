import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from "@clerk/nextjs/server";
import { eq } from 'drizzle-orm';
import { youtubeMediaTable } from '@/db/schemes';
import { db } from '@/db/db';
import { verifyUser } from '@/utils/users';
import { google } from 'googleapis';

/**
 * @swagger
 * api/posts/delete/youtube/{id}:
 *   delete:
 *     summary: Delete Youtube media post
 *     description: Deletes a specific Youtube media post for the authenticated user.
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the tweet to delete.
 *     responses:
 *       200:
 *         description: Successfully deleted Youtube media post.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tweet deleted"
 *       400:
 *         description: Missing Clerk user ID, post ID, or bad request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Clerk user id missing"
 *                 message:
 *                   type: string
 *                   example: "Post id missing"
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
 *         description: Youtube media not found or tweet not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Youtube account not found"
 *                 message:
 *                   type: string
 *                   example: "Tweet not found"
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

    if (req.method !== "DELETE") {
        return res.status(405).json({ error: "Method not allowed" });
    }

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

    const { id: postId } = req.query;

    if (!postId) {
        return res.status(400).json({ error: "Post id missing" });
    }

    const media = youtubeMedia[0];

    const tokenRefresh = media.tokenRefresh;

    const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_CALLBACK_URL
    );

    auth.setCredentials({
        refresh_token: tokenRefresh,
    });

    auth.on('tokens', async (tokens) => {
        if (tokens.access_token) {
            await db.update(youtubeMediaTable).set({ tokenAccess: tokens.access_token, tokenExpiration: tokens.expiry_date }).where(eq(youtubeMediaTable.clerkId, userId));
        }
    });

    const youtube = google.youtube({
        version: 'v3',
        auth
    });

    const posts = media.posts ? JSON.parse(media.posts!) : [];


    youtube.videos.delete({ id: postId.toString() }).then(async () => {

        const newPosts = posts.filter((post: any) => post.id !== postId);
        await db.update(youtubeMediaTable).set({ posts: JSON.stringify(newPosts) }).where(eq(youtubeMediaTable.clerkId, userId));

        return res.status(200).json({ message: `Youtube post ${postId.toString()} deleted` });
    }).catch((err) => {
        console.error(err);
        return res.status(404).json({ message: "Youtube post not found" });
    });
}