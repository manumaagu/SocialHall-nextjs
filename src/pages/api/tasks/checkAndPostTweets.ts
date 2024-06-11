import { NextApiRequest, NextApiResponse } from 'next';
import { eq } from 'drizzle-orm';
import { eventTable, pendingTweetsTable, twitterMediaTable } from '@/db/schemes';
import { db } from '@/db/db';
import { TweetV2PostTweetResult, TwitterApi } from 'twitter-api-v2';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    console.log("[CRONJOB] - Checking for pending twitter posts");

    const pendingTweets = await db.select().from(pendingTweetsTable);

    if (pendingTweets.length === 0) {
        return;
    }

    for (const tweet of pendingTweets) {
        const pendingId = tweet.id;
        const twitterMedia = await db.select().from(twitterMediaTable).where(eq(twitterMediaTable.clerkId, tweet.clerkId));
        // console.log(twitterMedia);

        if (twitterMedia.length === 0) {
            return;
        }

        const media = twitterMedia[0];
        const content = tweet.content ? JSON.parse(tweet.content) : [];
        const posts = media.posts ? JSON.parse(media.posts) : [];

        let tokenAccess = media.tokenAccess;
        let tokenRefresh = media.tokenRefresh;
        let tokenExpiration = media.tokenExpiration;
        let client = new TwitterApi({ clientId: process.env.TWITTER_CLIENT_ID as string, clientSecret: process.env.TWITTER_CLIENT_SECRET as string });


        if (tokenExpiration && Date.now() >= tokenExpiration) {  // Token expired so refresh it
            const { client: refreshedClient, accessToken, refreshToken: newRefreshToken, expiresIn } = await client.refreshOAuth2Token(tokenRefresh!);
            client = refreshedClient;
            console.log("[CRONJOB] - Twitter token refreshed successfully");
            await db.update(twitterMediaTable).set({ tokenAccess: accessToken, tokenRefresh: newRefreshToken, tokenExpiration: Date.now() + expiresIn * 1000 }).where(eq(twitterMediaTable.clerkId, tweet.clerkId));
        } else {
            client = new TwitterApi(tokenAccess!);
        }

        let postedTweet = null;

        if (content.length > 1) {
            postedTweet = await client.v2.tweetThread(content) as any[];
        } else {
            postedTweet = await client.v2.tweet(content[0].text) as any;

            // TODO: Add poll support

            // client.v2.tweet(tweet.content.text, { poll: { options: [], duration_minutes: 60 } })
        }

        console.log("[CRONJOB] - Twitter post posted successfully: ", postedTweet);

        await db.update(eventTable).set({ posted: 1 }).where(eq(eventTable.id, pendingId));

        const impressions = Math.floor(Math.random() * 1000);
        const comments = Math.floor(impressions * 0.1);
        const likes = Math.floor(impressions * 0.2);

        const statisticsObject = {
            "date": Date.now(),
            "impressions": impressions,
            "comments": comments,
            "likes": likes,
        }

        const statisticsArray = [statisticsObject];

        const tweetObject = {
            id: postedTweet.data.id,
            text: postedTweet.data.text,
            date: new Date().getTime(),
            statisticsArray: statisticsArray
        }

        posts.push(tweetObject);

        console.log(posts);

        await db.update(twitterMediaTable).set({ posts: JSON.stringify(posts) }).where(eq(twitterMediaTable.id, tweet.clerkId));

        await db.delete(pendingTweetsTable).where(eq(pendingTweetsTable.id, pendingId));
    }
}