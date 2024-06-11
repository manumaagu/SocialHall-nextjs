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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

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

        console.log(fields);

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

        console.log(tweets);

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