import type { ApiOrder } from '@/types/orders-api';

const NESTED_KEYS = [
    'tour',
    'venue',
    'client',
    'show_dates',
    'order_items',
    'collaborators',
    'item_statuses',
    'statuses',
    'tags',
] as const satisfies readonly (keyof ApiOrder)[];

/**
 * gtc-api PATCH may return a partial order (updated scalars only). Preserve
 * existing embeds when the patch body omits them so slideout state stays intact.
 */
export function mergeApiOrderUpdate(
    existing: ApiOrder,
    patch: ApiOrder,
): ApiOrder {
    const merged: ApiOrder = { ...existing, ...patch };

    for (const key of NESTED_KEYS) {
        const patchValue = patch[key];
        if (!(key in patch) || patchValue === undefined) {
            (merged as Record<string, unknown>)[key] = existing[key];
        }
    }

    return merged;
}
