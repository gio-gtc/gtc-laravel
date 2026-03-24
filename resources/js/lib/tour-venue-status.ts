import { tourVenueStatusData } from '@/components/mockdata';

export const TOUR_VENUE_STATUS_IDS: number[] = tourVenueStatusData.map(
    (row) => row.id,
);

export const TOUR_VENUE_STATUS_OPTIONS: { id: number; label: string }[] =
    tourVenueStatusData.map(({ id, label }) => ({ id, label }));
