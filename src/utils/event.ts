let eventGuid = 0
let todayStr = new Date().toISOString().replace(/T.*$/, '') // YYYY-MM-DD of today

export const INITIAL_EVENTS = [
    {
        id: createEventId(),
        title: 'All-day event',
        start: todayStr,
        resourceId: 'a',
    },
    {
        id: createEventId(),
        title: 'Timed event',
        start: todayStr + 'T12:00:00',
        resourceId: 'b',
    }
]

export function createEventId() {
    return String(eventGuid++)
}

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
