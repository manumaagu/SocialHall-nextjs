/**
 * Returns specific color for each social media
 * @param socialMedia
 * @returns color - Format #RRGGBB
 */
export function socialMediaColor(socialMedia: string): string {
    switch (socialMedia.toLowerCase()) {
        case 'twitter':
            return '#1DA1F2';
        case 'linkedin':
            return '#0A66C2';
        case 'youtube':
            return '#FF0000';
        default:
            return '#000000';
    }
}

/**
 * Creates a new event
 * @param userId - Clerk user id
 * @param socialMedia - Social media name
 * @param pendingId - Pending post id
 * @param date - Date of the event
 * @param content - Content of the pending post
 * @returns 
 */
export async function createEvent(userId: string, socialMedia: string, pendingId: string, date: number, content: string) {

    const body = {
        userId: userId,
        socialMedia: socialMedia,
        pendingId: pendingId,
        date: date,
        content: content
    };

    const clientUrl = process.env.NEXT_PUBLIC_CLIENT_URL;
    await fetch(`${clientUrl}/api/events/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
}
