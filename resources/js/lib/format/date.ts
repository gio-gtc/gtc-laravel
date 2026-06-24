import { format, isValid, parse, parseISO } from 'date-fns';

const TABLE_DUE_DATE_MISSING = '—';

/** Short month + day for table cells (e.g. "Jun 15"). Date-only strings are local calendar dates. */
export function formatShortUsDate(dateString: string): string {
    const dateOnly = dateString.split('T')[0];
    const date = parseISO(dateOnly);
    if (!isValid(date)) {
        return dateString;
    }

    return format(date, 'MMM d');
}

/** Billing/invoice table date (e.g. "6/22/26"). Returns "—" when invalid or missing. */
export function formatNumericUsDate(
    dateString: string | null | undefined,
): string {
    if (!dateString) {
        return TABLE_DUE_DATE_MISSING;
    }

    const dateOnly = dateString.split('T')[0];
    const date = parseISO(dateOnly);
    if (!isValid(date)) {
        return TABLE_DUE_DATE_MISSING;
    }

    return format(date, 'M/d/yy');
}

/** Parse slideout table due-date display (e.g. "Jun 15" or legacy "6/15/26") to yyyy-MM-dd. */
export function tableDueDateDisplayToIso(display: string): string | undefined {
    const trimmed = display.trim();
    if (!trimmed || trimmed === TABLE_DUE_DATE_MISSING) {
        return undefined;
    }

    const referenceDate = new Date();
    for (const pattern of ['MMM d', 'M/d/yy'] as const) {
        const parsed = parse(trimmed, pattern, referenceDate);
        if (isValid(parsed)) {
            return format(parsed, 'yyyy-MM-dd');
        }
    }

    const isoDateOnly = trimmed.split('T')[0];
    const fromIso = parseISO(isoDateOnly);
    if (isValid(fromIso)) {
        return format(fromIso, 'yyyy-MM-dd');
    }

    return undefined;
}

function tableDueDateSortKey(display: string): number | null {
    const iso = tableDueDateDisplayToIso(display);
    if (!iso) {
        return null;
    }
    return parseISO(iso).getTime();
}

/** Compare table due-date displays; missing dates always sort last. */
export function compareTableDueDateDisplays(
    a: string,
    b: string,
    direction: 'asc' | 'desc',
): number {
    const keyA = tableDueDateSortKey(a);
    const keyB = tableDueDateSortKey(b);
    const aMissing = keyA === null;
    const bMissing = keyB === null;

    if (aMissing && bMissing) {
        return 0;
    }
    if (aMissing) {
        return 1;
    }
    if (bMissing) {
        return -1;
    }

    const cmp = keyA - keyB;
    return direction === 'asc' ? cmp : -cmp;
}
