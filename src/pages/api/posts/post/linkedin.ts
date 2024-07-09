import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from "@clerk/nextjs/server";
import { eq } from 'drizzle-orm';
import { InsertPendingLinkedin, pendingLinkedinTable, linkedinMediaTable } from '@/db/schemes';
import { db } from '@/db/db';
import { randomBytes } from 'crypto';
import { verifyUser } from '@/utils/users';
import * as formidable from 'formidable';
import { Fields } from 'formidable';
import { ShareMedia, shareMediaCategory } from '@/interfaces/social-media';
import { createEvent } from '@/utils/event';

export const config = {
    api: {
        bodyParser: false,
    }
};

/**
 * @swagger
 * api/posts/post/linkedin:
 *   post:
 *     summary: Add LinkedIn posts to pending queue
 *     description: Adds LinkedIn posts to the pending queue for the authenticated user.
 *     tags:
 *       - Posts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 example: "2023-01-01T00:00:00Z"
 *               content:
 *                 type: object
 *                 example: { "text": "This is a LinkedIn post content" }
 *     responses:
 *       200:
 *         description: Successfully added LinkedIn posts to pending queue.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "LinkedIn posts added to pending queue"
 *       400:
 *         description: Missing Clerk user ID or bad request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Clerk user ID missing"
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
 *       404:
 *         description: LinkedIn account not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "LinkedIn account not found"
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

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(400).json({ error: "Clerk user id missing" });
    }

    if (!verifyUser(userId)) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const linkedinMedia = await db.select().from(linkedinMediaTable).where(eq(linkedinMediaTable.clerkId, userId));

    if (linkedinMedia.length === 0) {
        return res.status(404).json({ error: "Linkedin account not found" });
    }

    const form = new formidable.IncomingForm({ multiples: true });

    form.parse(req, async (err, fields: Fields) => {
        console.log(fields);
        if (err) {
            return res.status(500).json({ error: "Error parsing form data" });
        }

        const postingDate: number = fields.date ? Number(fields.date[0]) : 0;

        let assets: [];

        if (fields.assets) {
            assets = JSON.parse(fields.assets[0]);
            assets.forEach((asset: string) => {
                media.push({
                    "status": "READY",
                    "media": asset,
                });
            });
        }

        const shareCommentary: string = fields.shareCommentary ? fields.shareCommentary[0] : "";
        const shareMediaCategory = fields.shareMediaCategory ? fields.shareMediaCategory[0] : "";
        let media: { status: string; media: string; }[] = [];

        let contentToSend = {
            shareCommentary: shareCommentary,
            shareMediaCategory: shareMediaCategory,
            media: media,
        }

        const pendingLinkedin: InsertPendingLinkedin = {
            id: randomBytes(16).toString('hex'),
            clerkId: userId,
            postingDate: postingDate,
            content: JSON.stringify(contentToSend),
        };

        await db.insert(pendingLinkedinTable).values(pendingLinkedin);

        await createEvent(userId, 'linkedin', pendingLinkedin.id, postingDate, shareCommentary ? shareCommentary : "LinkedIn post, just media");

        res.status(200).json({ message: "Linkedin post added to pending queue" });
    });
}