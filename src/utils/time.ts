/**
 * Format time to YYYY:MM:DD T HH:MM:SS
 * @param timestamp - time to format in milliseconds
 * @returns formatted time
 */
export function timeToYear(timestamp: number): string {
    return new Date(timestamp).toISOString();
} 