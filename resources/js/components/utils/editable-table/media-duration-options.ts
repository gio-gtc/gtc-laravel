/** Fixed duration chips for media line items (mock + add-modal ranges; includes :20 from mock data). */
export const MEDIA_DURATION_OPTIONS = [
    ':10',
    ':15',
    ':20',
    ':30',
    ':45',
    ':60',
] as const;

export type MediaDurationOption = (typeof MEDIA_DURATION_OPTIONS)[number];
