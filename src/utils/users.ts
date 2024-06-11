import { db } from "@/db/db";
import { usersTable } from "@/db/schemes";
import { eq } from "drizzle-orm";

/**
 * Verify if the user exists in the database
 * @param userId - Clerk user id
 * @returns boolean - True if the user exists, false otherwise
 */
export async function verifyUser(userId: string): Promise<boolean> {
    const dbUser = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId));

    if (!dbUser[0] || dbUser.length !== 1) {
        return false;
    }

    return true;
}