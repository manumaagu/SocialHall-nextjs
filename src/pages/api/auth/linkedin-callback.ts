import type { NextApiRequest, NextApiResponse } from 'next';
import { randomBytes } from 'crypto';
import { InsertLinkedinMedia, linkedinMediaTable } from '@/db/schemes';
import { db } from '@/db/db';
import { getAuth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { verifyUser } from '@/utils/users';

/**
 * @swagger
 * api/auth/linkedin-callback:
 *   get:
 *     summary: LinkedIn OAuth Callback
 *     description: Handles the LinkedIn OAuth callback, exchanges the authorization code for an access token, and updates the user's LinkedIn media information.
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: query
 *         name: code
 *         required: false
 *         schema:
 *           type: string
 *         description: The authorization code returned by LinkedIn.
 *       - in: query
 *         name: error
 *         required: false
 *         schema:
 *           type: string
 *         description: The error returned by LinkedIn, if any.
 *     responses:
 *       200:
 *         description: Successfully handled LinkedIn OAuth callback.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully handled LinkedIn OAuth callback"
 *       400:
 *         description: Missing Clerk user ID or bad request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Clerk user id missing"
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
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(400).json({ error: "Clerk user id missing" });
    }

    if (!verifyUser(userId)) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { code, error } = req.query;

    if (error) {
        res.redirect(process.env.CLIENT_URL as string);
        return;
    }

    try {
        const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code as string,
                redirect_uri: process.env.CLIENT_URL as string + process.env.LINKEDIN_CALLBACK_URL as string,
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

        let linkedinMedia = await db.select().from(linkedinMediaTable).where(eq(linkedinMediaTable.clerkId, userId));

        let followArray: any[] = [];

        for (let i = 0; i < 3; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i); 

            const followObject = {
                date: date,
                count: Math.floor(Math.random() * 1001),
            };

            followArray.push(followObject);
        }

        // const followObject = {
        //     date: Date.now(),
        //     count: Math.floor(Math.random() * 1001),
        // };

        // const followArray = [followObject];

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
                profile_followers: JSON.stringify(followArray),
            };

            await db.insert(linkedinMediaTable).values(newLinkedinMedia);
        } else {

            await db.update(linkedinMediaTable).set({ date: Date.now().toString(), tokenAccess: access_token, tokenExpiration: Date.now() + expires_in * 1000 }).where(eq(linkedinMediaTable.clerkId, userId));
        }

        res.redirect(process.env.CLIENT_URL as string);
    } catch (error) {
        console.error('LinkedIn Auth Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}