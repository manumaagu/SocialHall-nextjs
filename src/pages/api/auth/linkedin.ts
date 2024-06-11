import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from "@clerk/nextjs/server";
import { usersTable } from '@/db/schemes';
import { db } from '@/db/db';
import { eq } from 'drizzle-orm';
import { verifyUser } from '@/utils/users';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(400).json({ error: "Clerk user id missing" });
    }

    if(!verifyUser(userId)) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    return res.json({
        url: 'https://www.linkedin.com/oauth/v2/authorization?' + new URLSearchParams({
            response_type: 'code',
            client_id: process.env.LINKEDIN_CLIENT_ID as string,
            redirect_uri: process.env.LINKEDIN_CALLBACK_URL as string,
            state: 'state', // Random string
            scope: 'openid profile email w_member_social',
        })
    });
}