import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from "@clerk/nextjs/server";
import { eq } from 'drizzle-orm';
import { linkedinMediaTable, usersTable } from '@/db/schemes';
import { db } from '@/db/db';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(400).json({ error: "Clerk user id missing" });
    }

    const dbUser = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId));

    if (!dbUser[0] || dbUser.length !== 1) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const linkedinMedia = await db.select().from(linkedinMediaTable).where(eq(linkedinMediaTable.clerkId, userId));

    if (linkedinMedia.length === 0) {
        return res.status(404).json({ error: "Linkedin account not found" });
    }

    await db.delete(linkedinMediaTable).where(eq(linkedinMediaTable.clerkId, userId));

    res.status(200).json({ message: "Account revoked" });
}