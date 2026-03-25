import type { TourVenueStatusRow } from '@/types';

export function tourVenueStatusIds(rows: TourVenueStatusRow[]): number[] {
    return rows.map((row) => row.id);
}
