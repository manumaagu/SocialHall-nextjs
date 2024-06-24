import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from "@clerk/nextjs/server";
import { eq } from 'drizzle-orm';
import { twitterMediaTable, InsertPendingTweets, pendingTweetsTable } from '@/db/schemes';
import { db } from '@/db/db';
import { SendTweetV2Params } from 'twitter-api-v2';
import { randomBytes } from 'crypto';
import { verifyUser } from '@/utils/users';
import * as formidable from 'formidable';
import { Fields } from 'formidable';
import { createEvent } from '@/utils/event';

export const config = {
    api: {
        bodyParser: false,
    }
};

/**
 * @swagger
 * api/posts/post/twitter:
 *   post:
 *     summary: Add tweets to pending queue
 *     description: Adds tweets to the pending queue for the authenticated user.
 *     tags:
 *       - Posts
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-01-01T00:00:00Z"
 *               tweets:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "This is a tweet"
 *     responses:
 *       200:
 *         description: Successfully added tweets to pending queue.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tweets added to pending queue"
 *       400:
 *         description: Missing Clerk user ID or bad request.
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
 *       500:
 *         description: Internal server error, such as form parsing errors.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error parsing form data"
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== "POST") {
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

    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields: Fields) => {
        if (err) {
            return res.status(500).json({ error: "Error parsing form data" });
        }

        const postingDate: number = fields.date ? Number(fields.date[0]) : 0;

        let tweets: SendTweetV2Params[] = [];

        Object.keys(fields).forEach(key => {
            if (key.startsWith('tweets[')) {
                const tweetArray = fields[key];
                if (Array.isArray(tweetArray) && tweetArray.length > 0) {
                    const tweetText = tweetArray[0];
                    if (typeof tweetText === 'string') {
                        tweets.push({ text: tweetText });
                    }
                }
            }
        });

        const pendingTweet: InsertPendingTweets = {
            id: randomBytes(16).toString('hex'),
            clerkId: userId,
            postingDate: postingDate,
            content: JSON.stringify(tweets),
        };

        await db.insert(pendingTweetsTable).values(pendingTweet);

        await createEvent(userId, 'twitter', pendingTweet.id, postingDate, tweets[0].text!);

        res.status(200).json({ message: "Tweets added to pending queue" });
    });
}