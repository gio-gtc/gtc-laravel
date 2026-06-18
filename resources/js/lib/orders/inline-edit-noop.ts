import { parseDurationWireAsSeconds } from '@/lib/orders/broadcast-spec-wire';
import type { User } from '@/types';

function normalizeDurationSeconds(wire: string): number | null {
    const trimmed = wire.trim();
    if (trimmed === '') {
        return null;
    }
    const parsed = parseDurationWireAsSeconds(trimmed);
    if (parsed !== null) {
        return parsed;
    }
    const asNumber = Number.parseInt(trimmed, 10);
    return Number.isFinite(asNumber) ? asNumber : null;
}

/** True when inline duration edit did not change the wire value. */
export function isInlineDurationUnchanged(
    originalWire: string,
    currentWire: string,
): boolean {
    const original = normalizeDurationSeconds(originalWire);
    const current = normalizeDurationSeconds(currentWire);
    if (original === null || current === null) {
        return originalWire.trim() === currentWire.trim();
    }
    return original === current;
}

/** True when inline status label did not change. */
export function isInlineStatusUnchanged(
    originalLabel: string,
    currentLabel: string,
): boolean {
    return originalLabel.trim() === currentLabel.trim();
}

/** Stable sorted id list for assignee set comparison. */
export function assigneeIdSetFingerprint(ids: readonly number[]): string {
    return [...ids].sort((a, b) => a - b).join(',');
}

/** True when row assignees match the next selection (order-independent). */
export function rowAssigneesUnchanged(
    rowAssigned: readonly Pick<User, 'id'>[],
    nextUserIds: readonly number[],
): boolean {
    const currentIds = rowAssigned.map((user) => user.id);
    return (
        assigneeIdSetFingerprint(currentIds) ===
        assigneeIdSetFingerprint(nextUserIds)
    );
}
