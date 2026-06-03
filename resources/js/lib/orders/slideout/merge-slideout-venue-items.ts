import type { OrderItemsRow } from '@/types';

/** Merge API-derived lines with localized mock rows from the page catalog. */
export function mergeSlideoutVenueItems(
    apiItems: OrderItemsRow[],
    catalogLocalizedItems: OrderItemsRow[] | undefined,
): OrderItemsRow[] {
    const localized = (catalogLocalizedItems ?? []).filter(
        (r) => r.type === 'localized',
    );
    return [...apiItems, ...localized];
}
