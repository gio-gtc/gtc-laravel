import type { VenueItemsRow } from '@/types';

/** Merge API-derived lines with localized mock rows from the page catalog. */
export function mergeSlideoutVenueItems(
    apiItems: VenueItemsRow[],
    catalogLocalizedItems: VenueItemsRow[] | undefined,
): VenueItemsRow[] {
    const localized = (catalogLocalizedItems ?? []).filter(
        (r) => r.type === 'localized',
    );
    return [...apiItems, ...localized];
}
