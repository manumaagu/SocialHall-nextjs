import type { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { getAuth } from '@clerk/nextjs/server';
import { db } from '@/db/db';
import { linkedinMediaTable } from '@/db/schemes';
import { eq } from 'drizzle-orm';
import { verifyUser } from '@/utils/users';

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

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: MulterAuthRequest, res: NextApiResponse) {

    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(400).json({ error: "Clerk user id missing" });
    }

    if(!verifyUser(userId)) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const linkedinMedia = await db.select().from(linkedinMediaTable).where(eq(linkedinMediaTable.clerkId, userId));

    if (linkedinMedia.length === 0) {
        return res.status(404).json({ error: "Linkedin account not found" });
    }

    const files = req.files;

    if (!files || files.length === 0) {
        res.status(400).json({ message: "No files provided" });
    }

    let assets = [];

    if (!linkedinMedia || linkedinMedia.length === 0) {
        return;
    }

    const accessToken = linkedinMedia[0].tokenAccess;

    for (const file of files!) {

        const body = {
            "registerUploadRequest": {
                "owner": "urn:li:person:" + linkedinMedia[0].profile_id,
                "recipes": [
                    "urn:li:digitalmediaRecipe:feedshare-" + file.mimetype.split('/')[0]
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

        const fileOpen = fs.readFileSync(file.path);

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


        fs.unlink(file.path, (err) => {
            if (err) {
                console.error("Error deleting file: ", err);
            }
        });
    }

    console.log("[DEBUG] Linkedin media uploaded successfully");

    return assets;

}