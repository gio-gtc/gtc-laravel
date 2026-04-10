import { formatDurationSeconds } from '@/helper-functions/format-time';

/** Broadcast & streaming + social video tables (aligned with add modals). */
const BROADCAST_SOCIAL_DEFAULT_SECONDS = [10, 15, 30] as const;

/** Radio / audio table (aligned with add audio modal). */
const AUDIO_DEFAULT_SECONDS = [15, 30, 60] as const;

export type MediaTableDurationVariant = 'broadcastSocial' | 'audio';

/**
 * Dropdown options: default lengths per section only, plus the row’s current
 * length when it is not one of those defaults.
 */
export function durationSelectOptionsForMediaTable(
    currentSeconds: number,
    variant: MediaTableDurationVariant,
): { value: string; label: string }[] {
    const defaults =
        variant === 'audio'
            ? AUDIO_DEFAULT_SECONDS
            : BROADCAST_SOCIAL_DEFAULT_SECONDS;
    const base = defaults.map((s) => ({
        value: String(s),
        label: formatDurationSeconds(s),
    }));
    const s = Math.max(0, Math.floor(currentSeconds));
    if (defaults.some((d) => d === s)) {
        return base;
    }
    return [
        ...base,
        {
            value: String(s),
            label: formatDurationSeconds(s),
        },
    ];
}
