import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from "@clerk/nextjs/server";
import { eq } from 'drizzle-orm';
import { twitterMediaTable, InsertPendingTweets, pendingTweetsTable } from '@/db/schemes';
import { db } from '@/db/db';
import { SendTweetV2Params } from 'twitter-api-v2';
import { randomBytes } from 'crypto';
import { verifyUser } from '@/utils/users';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(400).json({ error: "Clerk user id missing" });
    }

    if(!verifyUser(userId)) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const twitterMedia = await db.select().from(twitterMediaTable).where(eq(twitterMediaTable.clerkId, userId));

    if (twitterMedia.length === 0) {
        return res.status(404).json({ error: "Twitter account not found" });
    }

    const contentToSend = req.body;
    const postingDate = contentToSend.date;

    let tweets: SendTweetV2Params[] = [];

    contentToSend.forEach((tweet: string) => {
        tweets.push({ text: tweet });
    });

    const pendingTweet: InsertPendingTweets = {
        id: randomBytes(16).toString('hex'),
        clerkId: userId,
        postingDate: postingDate,
        content: JSON.stringify(tweets),
    };

    await db.insert(pendingTweetsTable).values(pendingTweet);

    res.status(200).json({ message: "Tweets added to pending queue" });

}