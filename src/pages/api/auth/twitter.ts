import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from "@clerk/nextjs/server";
import NodeCache from 'node-cache';
import { TwitterApi } from 'twitter-api-v2';

const cache = new NodeCache();


export default function handler(req: NextApiRequest, res: NextApiResponse) {

    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const client = new TwitterApi({ clientId: process.env.TWITTER_CLIENT_ID as string, clientSecret: process.env.TWITTER_CLIENT_SECRET as string });

    const scopes = ['tweet.read', 'tweet.write', 'users.read', 'offline.access'];

    const { url, codeVerifier, state } = client.generateOAuth2AuthLink(process.env.TWITTER_CALLBACK_URL as string, { scope: scopes });

    cache.set("codeVerifier", codeVerifier, 120);
    cache.set("state", state, 120);

    return res.json({ url: url });
}