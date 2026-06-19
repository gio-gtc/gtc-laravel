import type { OrderItemsRow } from '@/types';

/** API-backed rows win; keep optimistic extras only while not yet in API list. */
export function mergeApiAndExtraVenueItems(
    apiDerived: OrderItemsRow[],
    extra: OrderItemsRow[],
): OrderItemsRow[] {
    const apiIds = new Set(apiDerived.map((row) => String(row.id)));
    const optimisticExtra = extra.filter(
        (row) => row.is_pending || !apiIds.has(String(row.id)),
    );
    return [...apiDerived, ...optimisticExtra];
}
