import type { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { getAuth } from '@clerk/nextjs/server';
import { db } from '@/db/db';
import { linkedinMediaTable } from '@/db/schemes';
import { eq } from 'drizzle-orm';
import { verifyUser } from '@/utils/users';
import * as formidable from 'formidable';
import { Fields, Files } from 'formidable';

export const config = {
    api: {
        bodyParser: false,
    }
};

interface MulterAuthRequest extends NextApiRequest {
    files?: Express.Multer.File[];
}

const uploadDirectory = path.join(process.cwd(), 'src', 'uploads');

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDirectory);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

/**
 * @swagger
 * api/upload-media/linkedin:
 *   post:
 *     summary: Upload media to LinkedIn for a user
 *     description: Uploads media files to LinkedIn associated with the authenticated user.
 *     tags:
 *       - Upload Media
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Successfully uploaded LinkedIn media.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 example: "urn:li:digitalmediaAsset:C4D00AAAAbBCDEFG"
 *       400:
 *         description: Missing Clerk user ID or no files provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Clerk user ID missing"
 *                 message:
 *                   type: string
 *                   example: "No files provided"
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
export default async function handler(req: MulterAuthRequest, res: NextApiResponse) {

    if (req.method !== 'POST') {
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

    const media = linkedinMedia[0];

    const accessToken = media.tokenAccess;

    let assets: any[] = [];

    const form = new formidable.IncomingForm({ multiples: true });

    form.parse(req, async (err, fields: Fields, files: Files) => {
        if (err) {
            return res.status(500).json({ error: "Error parsing form data" });
        }

        if (!files) {
            return res.status(400).json({ error: "No files provided" });
        }

        const filesArray = Object.values(files);

        for (const file of filesArray) {
            const fileObject = file![0];
            const body = {
                "registerUploadRequest": {
                    "owner": "urn:li:person:" + media.profile_id,
                    "recipes": [
                        "urn:li:digitalmediaRecipe:feedshare-" + fileObject.mimetype!.split('/')[0]
                    ],
                    "serviceRelationships": [
                        {
                            "relationshipType": "OWNER",
                            "identifier": "urn:li:userGeneratedContent"
                        }
                    ]
                }
            }

            const response = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'X-Restli-Protocol-Version': '2.0.0',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error(`Linkedin media upload error: ${response.statusText}`);
            }

            const data = await response.json();

            assets.push(data.value.asset);
            const uploadUrl = data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;

            const fileOpen = fs.readFileSync(fileObject.filepath);

            const uploadResponse = await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'X-Restli-Protocol-Version': '2.0.0',
                    'Content-Type': 'application/binary'
                },
                body: fileOpen
            });

            if (!uploadResponse.ok) {
                throw new Error(`Linkedin media upload error: ${uploadResponse.statusText}`);
            }

            fs.unlink(fileObject.filepath, (err) => {
                if (err) {
                    console.error("Error deleting file: ", err);
                }
            });
        }

        console.log("[DEBUG] Linkedin media uploaded successfully");

        res.status(200).json({ message: "Media uploaded", assets: assets });
    });
}