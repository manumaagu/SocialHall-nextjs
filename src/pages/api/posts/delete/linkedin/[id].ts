import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from "@clerk/nextjs/server";
import { eq } from 'drizzle-orm';
import { linkedinMediaTable } from '@/db/schemes';
import { db } from '@/db/db';
import { verifyUser } from '@/utils/users';


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
        await db.update(linkedinMediaTable).set({ posts: newPosts }).where(eq(linkedinMediaTable.clerkId, userId));
        res.status(200).json({ message: "Post deleted" });
    } else {
        res.status(400).json({ message: "Post not found" });
    }

}