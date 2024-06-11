import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from "@clerk/nextjs/server";
import { TwitterApi } from 'twitter-api-v2';
import { InsertTemporaryTokens, temporaryTokensTable } from '@/db/schemes';
import { db } from '@/db/db';
import { verifyUser } from '@/utils/users';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(400).json({ error: "Clerk user id missing" });
    }

    if(!verifyUser(userId)) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const client = new TwitterApi({ clientId: process.env.TWITTER_CLIENT_ID as string, clientSecret: process.env.TWITTER_CLIENT_SECRET as string });

    const scopes = ['tweet.read', 'tweet.write', 'users.read', 'offline.access'];

    const { url, codeVerifier, state } = client.generateOAuth2AuthLink(process.env.TWITTER_CALLBACK_URL as string, { scope: scopes });

    console.log('codeVerifier', codeVerifier, 'state', state);

    const newTemporaryTokens: InsertTemporaryTokens = {
        id: userId,
        codeVerifier: codeVerifier,
        state: state
    };

    await db.insert(temporaryTokensTable).values(newTemporaryTokens);

    return res.json({ url: url });
}