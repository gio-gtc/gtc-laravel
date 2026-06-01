import { format, isValid, parseISO } from 'date-fns';

/** Short month + day for table cells (e.g. "Jun 15"). Date-only strings are local calendar dates. */
export function formatShortUsDate(dateString: string): string {
    const dateOnly = dateString.split('T')[0];
    const date = parseISO(dateOnly);
    if (!isValid(date)) {
        return dateString;
    }

    return format(date, 'MMM d');
}
