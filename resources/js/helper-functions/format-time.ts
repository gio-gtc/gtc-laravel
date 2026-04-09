import { differenceInCalendarDays } from 'date-fns';

/**
 * Formats a duration in whole seconds as M:SS (minutes unpadded, seconds two digits).
 * Negative values are treated as 0; fractional seconds are floored.
 */
export function formatDurationSeconds(totalSeconds: number): string {
    const safe = Math.max(0, Math.floor(totalSeconds));
    const minutes = Math.floor(safe / 60);
    const seconds = safe % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function getDaysRemaining(
    targetDate: string | null,
    id?: number,
): number {
    if (targetDate === null) {
        console.log(`Release date missing! ID: ${id}`);
        return 0;
    }
    return differenceInCalendarDays(new Date(targetDate), new Date());
}
