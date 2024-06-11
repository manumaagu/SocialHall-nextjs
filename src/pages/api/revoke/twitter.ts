import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from "@clerk/nextjs/server";
import { eq } from 'drizzle-orm';
import { twitterMediaTable, usersTable } from '@/db/schemes';
import { db } from '@/db/db';
import { TwitterApi } from 'twitter-api-v2';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(400).json({ error: "Clerk user id missing" });
    }

    const dbUser = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId));

    if (!dbUser[0] || dbUser.length !== 1) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const twitterMedia = await db.select().from(twitterMediaTable).where(eq(twitterMediaTable.clerkId, userId));

    if (twitterMedia.length === 0) {
        return res.status(404).json({ error: "Twitter account not found" });
    }

    let tokenAccess = twitterMedia[0].tokenAccess;
    let tokenRefresh = twitterMedia[0].tokenRefresh;
    let tokenExpiration = twitterMedia[0].tokenExpiration;
    let client = new TwitterApi({ clientId: process.env.TWITTER_CLIENT_ID as string });

    if (tokenExpiration && Date.now() >= tokenExpiration) {  // Token expired 
        client.revokeOAuth2Token(tokenRefresh!, 'refresh_token');
    }

    client.revokeOAuth2Token(tokenAccess!, 'access_token');

    console.log(`[TWITTER] Account revoked for user ${userId}`);

    await db.delete(twitterMediaTable).where(eq(twitterMediaTable.clerkId, userId));

    res.status(200).json({ message: "Account revoked" });
}