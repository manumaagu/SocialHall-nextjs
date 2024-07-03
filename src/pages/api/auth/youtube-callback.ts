import type { NextApiRequest, NextApiResponse } from 'next';
import { randomBytes } from 'crypto';
import { InsertYoutubeMedia, youtubeMediaTable } from '@/db/schemes';
import { db } from '@/db/db';
import { getAuth } from '@clerk/nextjs/server';
import { google } from 'googleapis';
import { verifyUser } from '@/utils/users';

/**
 * @swagger
 * api/auth/youtube-callback:
 *   get:
 *     summary: Google OAuth Callback
 *     description: Handles the Google OAuth callback, exchanges the authorization code for an access token, and updates the user's YouTube media information.
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: query
 *         name: code
 *         required: false
 *         schema:
 *           type: string
 *         description: The authorization code returned by Google.
 *       - in: query
 *         name: error
 *         required: false
 *         schema:
 *           type: string
 *         description: The error returned by Google, if any.
 *     responses:
 *       200:
 *         description: Successfully handled Google OAuth callback.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully handled Google OAuth callback"
 *       400:
 *         description: Missing Clerk user ID, code, or bad request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Clerk user id missing"
 *                 message:
 *                   type: string
 *                   example: "No channel found!"
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
 *       403:
 *         description: Invalid verifier or access tokens.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid verifier or access tokens!"
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

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.CLIENT_URL as string + process.env.GOOGLE_CALLBACK_URL as string
    );

    const { tokens } = await oauth2Client.getToken(code!.toString());
    oauth2Client.setCredentials(tokens);

    const youtube = google.youtube({
        version: 'v3',
        auth: oauth2Client
    });

    const response = await youtube.channels.list({
        part: ['statistics, snippet'],
        mine: true,
    });

    if (!response.data.items || response.data.items.length === 0 || !response.data.items[0].snippet || !response.data.items[0].snippet.thumbnails?.default || !response.data.items[0].statistics || !response.data.items[0].statistics.subscriberCount) {
        return res.status(400).send('No channel found!');
    }

    const id = response.data.items[0].id;
    const username = response.data.items[0].snippet.title;
    const url = `https://www.youtube.com/${response.data.items![0].snippet.customUrl}`;
    const picture = response.data.items[0].snippet.thumbnails.default.url;
    const subscriberCount = response.data.items[0].statistics.subscriberCount;

    const followerObject = {
        "date": Date.now(),
        "count": subscriberCount
    }

    const followerArray = [followerObject];

    try {
        const youtubeMedia: InsertYoutubeMedia = {
            id: randomBytes(16).toString("hex"),
            clerkId: userId,
            date: Date.now().toString(),
            tokenAccess: tokens.access_token,
            tokenRefresh: tokens.refresh_token,
            tokenExpiration: tokens.expiry_date,
            profile_id: id,
            profile_username: username,
            profile_url: url,
            profile_picture: picture,
            profile_followers: JSON.stringify(followerArray),
        };

        await db.insert(youtubeMediaTable).values(youtubeMedia);

        res.redirect(process.env.CLIENT_URL as string);
    } catch (error) {
        console.error('Error logging in with OAuth2:', error);
        res.status(403).send('Invalid verifier or access tokens!');
    }
}
