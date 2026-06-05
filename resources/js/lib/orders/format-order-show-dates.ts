import type { ApiOrder, OrderShowDate } from '@/types/orders-api';
import { parseISO } from 'date-fns';

function dateOnly(value: string | null | undefined): string {
    if (!value) {
        return new Date().toISOString().slice(0, 10);
    }
    return value.split('T')[0];
}

/** Min/max show_date for TourVenue start/end (falls back to due_date / created_at). */
export function orderShowDateRange(order: ApiOrder): {
    start: string;
    end: string;
} {
    const dates =
        order.show_dates?.map((d) => d.show_date).filter(Boolean) ?? [];
    if (dates.length > 0) {
        const sorted = [...dates].sort();
        return { start: sorted[0], end: sorted[sorted.length - 1] };
    }
    const fallback = dateOnly(order.due_date ?? order.created_at);
    return { start: fallback, end: fallback };
}

function formatSingleShowDate(dateStr: string): string {
    const date = parseISO(dateStr.split('T')[0]);
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    }).format(date);
}

/** Header display for `order.show_dates` — every date, joined with " & ". */
export function formatOrderShowDatesForHeader(
    showDates: OrderShowDate[] | undefined,
): string | undefined {
    if (!showDates?.length) {
        return undefined;
    }

    const sorted = [...showDates].sort((a, b) =>
        a.show_date.localeCompare(b.show_date),
    );

    return sorted
        .map((row) => formatSingleShowDate(row.show_date))
        .join(' & ');
}

/** Legacy TourVenue start/end → same header format as API show_dates. */
export function formatVenueDateRangeForHeader(
    startDate: string,
    endDate: string,
): string | undefined {
    const start = dateOnly(startDate);
    const end = dateOnly(endDate);

    const rows: OrderShowDate[] =
        start === end
            ? [{ id: 0, order_id: 0, show_date: start }]
            : [
                  { id: 0, order_id: 0, show_date: start },
                  { id: 1, order_id: 0, show_date: end },
              ];

    return formatOrderShowDatesForHeader(rows);
}
