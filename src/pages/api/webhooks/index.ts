// pages/api/webhooks/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Webhook } from "svix";
import { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/db/db';
import { usersTable, InsertUser } from '@/db/schemes';
import { randomBytes } from 'crypto';
import { eq } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
        return res.status(500).json({ message: "WEBHOOK_SECRET is required in environment variables" });
    }

    const payload = JSON.stringify(req.body);
    const { "svix-id": svix_id, "svix-timestamp": svix_timestamp, "svix-signature": svix_signature } = req.headers;

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return res.status(400).json({ message: "Error occured -- no Svix headers" });
    }

    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;
    try {
        evt = wh.verify(payload, {
            "svix-id": svix_id as string,
            "svix-timestamp": svix_timestamp as string,
            "svix-signature": svix_signature as string,
        }) as WebhookEvent;
    } catch (err: any) {
        console.error("[CLERK] Webhook failed to verify. Error:", err.message);
        return res.status(400).json({ success: false, message: err.message });
    }

    const { id } = evt.data;

    switch (evt.type) {
        case "user.created":
            const newClerkId = id;

            const existingUser = await db.select().from(usersTable).where(eq(usersTable.clerkId, newClerkId!));

            if (existingUser.length > 0) {
                console.log(`User with clerkId ${newClerkId} already exists`);
                return res.status(409).json({ message: "User already exists" });
            }

            const newUser: InsertUser = {
                id: randomBytes(16).toString('hex'),
                clerkId: newClerkId as string,
                date: Date.now(),
            };

            await db.insert(usersTable).values(newUser);

            return res.status(201).json({ message: "User created successfully" });
            
        case "user.deleted":
            const deletedClerkId = id;
            const deleted = evt.data.deleted;

            const deletedUser = await db.select().from(usersTable).where(eq(usersTable.clerkId, deletedClerkId!));

            if (deletedUser.length === 0) {
                console.log(`User with clerkId ${deletedClerkId} does not exist`);
                return res.status(404).json({ message: "User does not exist" });
            }

            if (deleted) {
                await db.delete(usersTable).where(eq(usersTable.clerkId, deletedClerkId!));
            }

            return res.status(200).json({ message: "User deleted successfully" });

        default:
            console.log(`Unhandled event type: ${evt.type}`);
    }

    console.log(`[CLERK] Handled Webhook: ${evt.type}`);
    return res.status(200).json({
        success: true,
        message: "Webhook processed successfully",
    });
}
