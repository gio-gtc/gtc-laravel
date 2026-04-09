import { formatDurationSeconds } from '@/helper-functions/format-time';

/** Allowed duration lengths for media line items (seconds). */
export const MEDIA_DURATION_SECONDS = [10, 15, 20, 30, 45, 60] as const;

export type MediaDurationSeconds = (typeof MEDIA_DURATION_SECONDS)[number];

export const DURATION_SELECT_OPTIONS = MEDIA_DURATION_SECONDS.map(
    (seconds) => ({
        value: String(seconds),
        label: formatDurationSeconds(seconds),
    }),
);
