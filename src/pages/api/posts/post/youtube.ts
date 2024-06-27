import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from "@clerk/nextjs/server";
import { eq } from 'drizzle-orm';
import { youtubeMediaTable, InsertPendingYoutube, pendingYoutubeTable } from '@/db/schemes';
import { db } from '@/db/db';
import { randomBytes } from 'crypto';
import { verifyUser } from '@/utils/users';
import { utapi } from '@/uploadthing';
import * as formidable from 'formidable';
import { Fields, Files } from 'formidable';
import { FileEsque } from 'uploadthing/types';

export const config = {
    api: {
        bodyParser: false,
    }
};

/**
 * @swagger
 * api/posts/post/youtube:
 *   post:
 *     summary: Add Youtube content to pending queue
 *     description: Adds Youtube content to the pending queue for the authenticated user.
 *     tags:
 *       - Posts
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-01-01T00:00:00Z"
 *               content:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "This is a tweet"
 *     responses:
 *       200:
 *         description: Successfully added tweets to pending queue.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Youtube posts added to pending queue"
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
 *         description: Youtube account not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Youtube account not found"
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
 *       500:
 *         description: Internal server error, such as form parsing errors.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error parsing form data"
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

    const youtubeMedia = await db.select().from(youtubeMediaTable).where(eq(youtubeMediaTable.clerkId, userId));

    if (youtubeMedia.length === 0) {
        return res.status(404).json({ error: "Youtube account not found" });
    }

    let newFile: File;

    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields: Fields, files: Files) => {
        console.log(files.media);
        if (err) {
            return res.status(500).json({ error: "Error parsing form data" });
        }

        if (!files) {
            return res.status(400).json({ error: "No file provided" });
        }

        const postingDate: number = fields.date ? Number(fields.date[0]) : 0;

        const file = files!.media![0] as FileEsque;

        console.log(file);

        utapi.uploadFiles(file);


        // for (const file of filesArray) {
        //     const fileObject = file![0];
        //     const body = {
        //         "registerUploadRequest": {
        //             "owner": "urn:li:person:" + media.profile_id,
        //             "recipes": [
        //                 "urn:li:digitalmediaRecipe:feedshare-" + fileObject.mimetype!.split('/')[0]
        //             ],
        //             "serviceRelationships": [
        //                 {
        //                     "relationshipType": "OWNER",
        //                     "identifier": "urn:li:userGeneratedContent"
        //                 }
        //             ]
        //         }
        //     }

        //     const response = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
        //         method: 'POST',
        //         headers: {
        //             Authorization: `Bearer ${accessToken}`,
        //             'X-Restli-Protocol-Version': '2.0.0',
        //             'Content-Type': 'application/json'
        //         },
        //         body: JSON.stringify(body)
        //     });

        //     if (!response.ok) {
        //         throw new Error(`Linkedin media upload error: ${response.statusText}`);
        //     }

        //     const data = await response.json();

        //     assets.push(data.value.asset);
        //     const uploadUrl = data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;

        //     const fileOpen = fs.readFileSync(fileObject.filepath);

        //     const uploadResponse = await fetch(uploadUrl, {
        //         method: 'POST',
        //         headers: {
        //             Authorization: `Bearer ${accessToken}`,
        //             'X-Restli-Protocol-Version': '2.0.0',
        //             'Content-Type': 'application/binary'
        //         },
        //         body: fileOpen
        //     });

        //     if (!uploadResponse.ok) {
        //         throw new Error(`Linkedin media upload error: ${uploadResponse.statusText}`);
        //     }

        //     fs.unlink(fileObject.filepath, (err) => {
        //         if (err) {
        //             console.error("Error deleting file: ", err);
        //         }
        //     });
        // }

        // console.log("[DEBUG] Linkedin media uploaded successfully");

        // res.status(200).json({ message: "Media uploaded", assets: assets });
    });


    

    // const contentToSend = req.body;
    // const postingDate = contentToSend.date;

    // const pendingYoutube: InsertPendingYoutube = {
    //     id: randomBytes(16).toString('hex'),
    //     clerkId: userId,
    //     postingDate: postingDate,
    //     content: contentToSend,
    // };

    // await db.insert(pendingYoutubeTable).values(pendingYoutube);

    // res.status(200).json({ message: "Youtube posts added to pending queue" });

}