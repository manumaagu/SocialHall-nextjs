import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from "@clerk/nextjs/server";
import { eq } from 'drizzle-orm';
import { linkedinMediaTable } from '@/db/schemes';
import { db } from '@/db/db';
import { verifyUser } from '@/utils/users';


/**
 * @swagger
 * api/posts/delete/linkedin/{id}:
 *   delete:
 *     summary: Delete LinkedIn media post
 *     description: Deletes a specific LinkedIn media post for the authenticated user.
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to delete.
 *     responses:
 *       200:
 *         description: Successfully deleted LinkedIn media post.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post deleted"
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
 *         description: LinkedIn media not found or post not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "LinkedIn account not found"
 *                 message:
 *                   type: string
 *                   example: "Post not found"
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

    const linkedinMedia = await db.select().from(linkedinMediaTable).where(eq(linkedinMediaTable.clerkId, userId));

    if (linkedinMedia.length === 0) {
        return res.status(404).json({ error: "Linkedin account not found" });
    }

    const { id: postId } = req.query;

    if (!postId) {
        return res.status(400).json({ error: "Post id missing" });
    }

    const media = linkedinMedia[0];

    const accessToken = media.tokenAccess;

    const partialId = (postId as string).split(':')[3];

    const deletedPost = await fetch(`https://api.linkedin.com/v2/shares/${partialId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
        },
    });

    if (deletedPost.status === 200) {
        console.log(`[LINKEDIN] Post ${postId} deleted`);
        const posts = media.posts ? JSON.parse(media.posts) : [];
        const newPosts = posts.filter((post: { id: string | string[]; }) => post.id !== postId);
        media.posts = JSON.stringify(newPosts);
        await db.update(linkedinMediaTable).set({ posts: JSON.stringify(newPosts) }).where(eq(linkedinMediaTable.clerkId, userId));
        res.status(200).json({ message: "Post deleted" });
    } else {
        res.status(404).json({ message: "Post not found" });
    }
}