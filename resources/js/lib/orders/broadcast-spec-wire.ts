import { formatDurationSeconds } from '@/helper-functions/format-time';
import {
    INTERNATIONAL_LOCKED_DURATION_SECONDS,
    INTERNATIONAL_SPOT_TYPE,
    INTERNATIONAL_TV_PACKAGE_CUT,
} from '@/lib/orders/order-catalog';

export type InternationalDurationError = {
    ok: false;
    message: string;
};

/** Single catalog or custom label → API `encoding` array. */
export function encodingWireFromRowLabel(label: string): string[] {
    const text = label.trim();
    return text ? [text] : [];
}

/** Normalize read payloads: native array, legacy flat string, or empty. */
export function encodingLabelsFromWire(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value
            .filter((entry): entry is string => typeof entry === 'string')
            .map((entry) => entry.trim())
            .filter(Boolean);
    }
    if (typeof value === 'string' && value.trim()) {
        return [value.trim()];
    }
    return [];
}

/** Primary label for modal/table; multiple values joined for display. */
export function primaryEncodingLabel(labels: readonly string[]): string {
    return labels.filter(Boolean).join(' · ');
}

/** Stable fingerprint segment for duplicate detection (order-preserving). */
export function encodingFingerprint(labels: readonly string[]): string {
    return labels.map((l) => l.trim().toLowerCase()).join('\0');
}

/** Modal duration pill → wire string (`:30` → `"30"`, `1:12` → `"72"` or keep formatted). */
export function durationWireFromPill(pill: string): string {
    const trimmed = pill.trim();
    if (!trimmed) {
        return '';
    }
    if (trimmed.startsWith(':')) {
        const n = Number.parseInt(trimmed.slice(1), 10);
        return Number.isFinite(n) ? String(Math.max(0, n)) : trimmed;
    }
    const parts = trimmed.split(':');
    if (parts.length === 2) {
        const m = Number.parseInt(parts[0] || '0', 10);
        const s = Number.parseInt(parts[1] || '0', 10);
        if (Number.isFinite(m) && Number.isFinite(s)) {
            return String(Math.max(0, m * 60 + s));
        }
    }
    const parsed = Number.parseInt(trimmed, 10);
    if (Number.isFinite(parsed) && String(parsed) === trimmed) {
        return String(Math.max(0, parsed));
    }
    return trimmed;
}

/** Inline table numeric edit → wire string. */
export function durationWireFromNumericInput(value: number | string): string {
    const n =
        typeof value === 'number'
            ? value
            : Number.parseInt(String(value).trim(), 10);
    if (!Number.isFinite(n) || n < 0) {
        return '0';
    }
    return String(Math.floor(n));
}

/** Parse whole seconds from a wire duration when it is a plain integer string. */
export function parseDurationWireAsSeconds(wire: string): number | null {
    const trimmed = wire.trim();
    if (!trimmed || !/^\d+$/.test(trimmed)) {
        return null;
    }
    const n = Number.parseInt(trimmed, 10);
    return Number.isFinite(n) ? Math.max(0, n) : null;
}

/** Table/modal display: format numeric strings; pass through Variable/TBD/etc. */
export function durationDisplayLabel(wire: string): string {
    const trimmed = wire.trim();
    if (!trimmed) {
        return '—';
    }
    const seconds = parseDurationWireAsSeconds(trimmed);
    if (seconds !== null) {
        return formatDurationSeconds(seconds);
    }
    return trimmed;
}

export function isInternationalBroadcastSpec(type: string, cut: string): boolean {
    return (
        type === INTERNATIONAL_SPOT_TYPE || cut === INTERNATIONAL_TV_PACKAGE_CUT
    );
}

export function assertInternationalDuration(
    wire: string,
    type: string,
    cut: string,
): { ok: true } | InternationalDurationError {
    if (!isInternationalBroadcastSpec(type, cut)) {
        return { ok: true };
    }
    const seconds = parseDurationWireAsSeconds(wire);
    if (seconds === INTERNATIONAL_LOCKED_DURATION_SECONDS) {
        return { ok: true };
    }
    return {
        ok: false,
        message: `International spots require a duration of ${INTERNATIONAL_LOCKED_DURATION_SECONDS} seconds.`,
    };
}

/** Coerce legacy numeric API reads to wire string. */
export function durationWireFromSpecValue(value: unknown): string {
    if (typeof value === 'string') {
        return value.trim();
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
        return String(Math.max(0, Math.floor(value)));
    }
    return '';
}
