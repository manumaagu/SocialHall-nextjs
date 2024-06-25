import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from "@clerk/nextjs/server";
import { verifyUser } from '@/utils/users';

/**
 * @swagger
 * api/auth/linkedin:
 *   get:
 *     summary: Get LinkedIn OAuth URL
 *     description: Returns the LinkedIn OAuth URL for the authenticated user to authorize the application.
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Successfully retrieved LinkedIn OAuth URL.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   example: "https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&state=state&scope=openid%20profile%20email%20w_member_social"
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
 *       405:
 *         description: Method not allowed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Method not allowed"
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }   

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
            redirect_uri: process.env.CLIENT_URL as string + process.env.LINKEDIN_CALLBACK_URL as string,
            state: 'state', // Random string
            scope: 'openid profile email w_member_social',
        })
    });
}