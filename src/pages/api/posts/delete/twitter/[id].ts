import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from "@clerk/nextjs/server";
import { eq } from 'drizzle-orm';
import { twitterMediaTable } from '@/db/schemes';
import { db } from '@/db/db';
import { verifyUser } from '@/utils/users';
import { TwitterApi } from 'twitter-api-v2';

/**
 * @swagger
 * api/posts/delete/twitter/{id}:
 *   delete:
 *     summary: Delete Twitter media post
 *     description: Deletes a specific Twitter media post for the authenticated user.
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
 *         description: Successfully deleted Twitter media post.
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
 *         description: Twitter media not found or tweet not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Twitter account not found"
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

    const twitterMedia = await db.select().from(twitterMediaTable).where(eq(twitterMediaTable.clerkId, userId));

    if (twitterMedia.length === 0) {
        return res.status(404).json({ error: "Twitter account not found" });
    }

    const { id: postId } = req.query;

    if (!postId) {
        return res.status(400).json({ error: "Post id missing" });
    }

    const media = twitterMedia[0];

    let tokenAccess = media.tokenAccess;
    let tokenRefresh = media.tokenRefresh;
    let tokenExpiration = media.tokenExpiration;
    let client = new TwitterApi({ clientId: process.env.TWITTER_CLIENT_ID as string, clientSecret: process.env.TWITTER_CLIENT_SECRET as string });


    if (tokenExpiration && Date.now() >= tokenExpiration) {  // Token expired so refresh it
        const { client: refreshedClient, accessToken, refreshToken: newRefreshToken, expiresIn } = await client.refreshOAuth2Token(tokenRefresh!);
        client = refreshedClient;
        await db.update(twitterMediaTable).set({ tokenAccess: accessToken, tokenRefresh: newRefreshToken, tokenExpiration: Date.now() + expiresIn * 1000 }).where(eq(twitterMediaTable.clerkId, userId));
    } else {
        client = new TwitterApi(tokenAccess!);
    }

    const tweets = media.posts ? JSON.parse(media.posts!) : [];

    const tweet = await client.v2.deleteTweet(postId as string);

    if (tweet.data.deleted) {
        console.log(`[TWITTER] Tweet ${postId} deleted`);
        const newTweets = tweets.filter((tweet: { id: string | string[]; }) => tweet.id !== postId);
        await db.update(twitterMediaTable).set({ posts: newTweets }).where(eq(twitterMediaTable.clerkId, userId));
        res.status(200).json({ message: "Tweet deleted" });
    } else {
        res.status(404).json({ message: "Tweet not found" });
    }

}