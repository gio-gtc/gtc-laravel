import { eachDayOfInterval, format, parseISO } from 'date-fns';

/** Drop empty values, dedupe, and sort ISO date strings ascending. */
export function normalizeShowDates(dates: string[]): string[] {
    return [...new Set(dates.filter(Boolean))].sort();
}

/** Expand legacy venue start/end into one ISO date per show day (inclusive). */
export function expandVenueShowDates(
    startDate: string,
    endDate: string,
): string[] {
    const startIso = startDate.split('T')[0];
    const endIso = endDate.split('T')[0];
    const start = parseISO(startIso);
    const end = parseISO(endIso);

    return eachDayOfInterval({ start, end }).map((date) =>
        format(date, 'yyyy-MM-dd'),
    );
}

export function hasValidShowDates(dates: string[]): boolean {
    return normalizeShowDates(dates).length > 0;
}
