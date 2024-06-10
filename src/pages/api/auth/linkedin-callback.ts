// pages/api/linkedin/callback.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { randomBytes } from 'crypto';
import { InsertLinkedinMedia, linkedinMediaTable } from '@/db/schemes';
import { db } from '@/db/db';
import { LinkedinMedia } from '@/models/media-linkedin';
import { getAuth } from '@clerk/nextjs/server';
import { asc, count, eq, getTableColumns, gt, sql } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { code } = req.query;

    try {
        // Obtener el access token de LinkedIn
        const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code as string,
                redirect_uri: process.env.LINKEDIN_CALLBACK_URL as string,
                client_id: process.env.LINKEDIN_CLIENT_ID as string,
                client_secret: process.env.LINKEDIN_CLIENT_SECRET as string,
            }),
        });

        if (!tokenResponse.ok) {
            throw new Error('Failed to fetch access token');
        }

        const { access_token, expires_in } = await tokenResponse.json();


        const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        const profile = await profileResponse.json();

        console.log('LinkedIn Profile:', profile);

        let linkedinMedia = await db.select().from(linkedinMediaTable).where(eq(linkedinMediaTable.clerkId, userId));

        const followObject = {
            date: Date.now(),
            count: Math.floor(Math.random() * 1001),
        };

        // Insert or update LinkedinMedia
        if (linkedinMedia.length === 0) {
            const newLinkedinMedia: InsertLinkedinMedia = {
                id: randomBytes(16).toString("hex"),
                clerkId: userId,
                date: Date.now().toString(),
                tokenAccess: access_token,
                tokenExpiration: Date.now() + expires_in * 1000,
                profile_id: profile.sub,
                profile_username: profile.name,
                profile_picture: profile.picture,
                profile_followers: JSON.stringify(followObject),
            };

            await db.insert(linkedinMediaTable).values(newLinkedinMedia);
        } else {

            linkedinMedia[0].date = Date.now().toString();
            linkedinMedia[0].tokenAccess = access_token;
            linkedinMedia[0].tokenExpiration = Date.now() + expires_in * 1000;

            await db.update(linkedinMediaTable).set(linkedinMedia[0]);
        }

        res.redirect('http://localhost:3000/');
    } catch (error) {
        console.error('LinkedIn Auth Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}