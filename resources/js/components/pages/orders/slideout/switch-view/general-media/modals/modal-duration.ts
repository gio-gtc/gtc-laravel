import { formatDurationSeconds } from '@/helper-functions/format-time';

export type ModalDurationKind = 'broadcast' | 'social' | 'audio';

const BROADCAST_SOCIAL_DEFAULT_SECONDS = [10, 15, 30] as const;
const AUDIO_DEFAULT_SECONDS = [15, 30, 60] as const;

export function getDefaultDurationSecondsForModal(
    kind: ModalDurationKind,
): readonly number[] {
    return kind === 'audio'
        ? AUDIO_DEFAULT_SECONDS
        : BROADCAST_SOCIAL_DEFAULT_SECONDS;
}

export function isNonDefaultModalDuration(
    seconds: number,
    kind: ModalDurationKind,
): boolean {
    const s = Math.max(0, Math.floor(seconds));
    const defs = getDefaultDurationSecondsForModal(kind);
    return !defs.some((d) => d === s);
}

/**
 * Canonical pill label for `duration` state: colon shorthand for default
 * lengths, otherwise table-aligned `formatDurationSeconds`.
 */
export function durationSecondsToModalPillLabel(
    seconds: number,
    kind: ModalDurationKind,
): string {
    const s = Math.max(0, Math.floor(seconds));
    const defs = getDefaultDurationSecondsForModal(kind);
    if (defs.some((d) => d === s)) {
        return `:${s}`;
    }
    return formatDurationSeconds(s);
}

/** Parse a custom duration field (whole seconds) from user text input. */
export function parseCustomDurationSecondsInput(raw: string): number | null {
    const trimmed = raw.trim();
    if (trimmed === '') {
        return null;
    }
    const parsed = Number.parseInt(trimmed, 10);
    if (!Number.isFinite(parsed) || parsed < 0) {
        return null;
    }
    return parsed;
}

/** Map validated seconds input to modal duration pill label. */
export function customDurationInputToPillLabel(
    raw: string,
    kind: ModalDurationKind,
): string | null {
    const seconds = parseCustomDurationSecondsInput(raw);
    if (seconds === null) {
        return null;
    }
    return durationSecondsToModalPillLabel(seconds, kind);
}
