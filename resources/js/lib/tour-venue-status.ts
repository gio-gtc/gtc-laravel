import { type TourVenueStatusValue } from '@/types';

/** Human-readable labels; must include every `TourVenueStatusValue` when the union changes. */
export const TOUR_VENUE_STATUS_LABELS: Record<TourVenueStatusValue, string> = {
    'new-order': 'New Order',
    'in-progress': 'In Progress',
    'voice-over': 'Voice Over',
    audio: 'Audio',
    art: 'Art',
    paused: 'Paused',
    completed: 'Completed',
};

/** UI order for filters; add new `TourVenueStatusValue` members here and in `TOUR_VENUE_STATUS_LABELS`. */
export const TOUR_VENUE_STATUS_ORDER = [
    'new-order',
    'in-progress',
    'voice-over',
    'audio',
    'art',
    'paused',
    'completed',
] as const satisfies readonly TourVenueStatusValue[];

export const TOUR_VENUE_STATUS_VALUES: TourVenueStatusValue[] = [
    ...TOUR_VENUE_STATUS_ORDER,
];

export const TOUR_VENUE_STATUS_OPTIONS: {
    value: TourVenueStatusValue;
    label: string;
}[] = TOUR_VENUE_STATUS_ORDER.map((value) => ({
    value,
    label: TOUR_VENUE_STATUS_LABELS[value],
}));
