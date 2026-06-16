import { formatDurationSeconds } from '@/helper-functions/format-time';
import { parseDurationWireAsSeconds } from '@/lib/orders/broadcast-spec-wire';

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
    seconds: number | string,
    kind: ModalDurationKind,
): boolean {
    if (typeof seconds === 'string') {
        const parsed = parseDurationWireAsSeconds(seconds);
        if (parsed === null) {
            return true;
        }
        return isNonDefaultModalDuration(parsed, kind);
    }
    const s = Math.max(0, Math.floor(seconds));
    const defs = getDefaultDurationSecondsForModal(kind);
    return !defs.some((d) => d === s);
}

/**
 * Canonical pill label for `duration` state: colon shorthand for default
 * lengths, otherwise table-aligned `formatDurationSeconds` or raw wire text.
 */
export function durationSecondsToModalPillLabel(
    seconds: number | string,
    kind: ModalDurationKind,
): string {
    if (typeof seconds === 'string') {
        const trimmed = seconds.trim();
        const parsed = parseDurationWireAsSeconds(trimmed);
        if (parsed !== null) {
            return durationSecondsToModalPillLabel(parsed, kind);
        }
        return trimmed;
    }
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
