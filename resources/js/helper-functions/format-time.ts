import { differenceInCalendarDays, format, parseISO } from 'date-fns';

/**
 * Formats a duration in whole seconds as M:SS (minutes unpadded, seconds two digits).
 * Negative values are treated as 0; fractional seconds are floored.
 */
export function formatDurationSeconds(totalSeconds: number): string {
    const safe = Math.max(0, Math.floor(totalSeconds));
    const minutes = Math.floor(safe / 60);
    const seconds = safe % 60;
    return `${minutes || ''}:${String(seconds).padStart(2, '0')}`;
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

/** ISO 8601 UTC → "M/d/yyyy @ h:mmA" rendered in the viewer's local timezone. */
export function formatUtcAsLocalDateTime(iso: string): string {
    const d = parseISO(iso);
    return format(d, "M/d/yyyy '@' h:mma")
        .replace('am', 'AM')
        .replace('pm', 'PM');
}

/** Current time as ISO 8601 UTC (for new notes / UTC-first records). */
export function nowUtcIso(): string {
    return new Date().toISOString();
}
