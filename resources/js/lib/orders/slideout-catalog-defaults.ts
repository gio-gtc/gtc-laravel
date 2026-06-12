import type { OrderItemsRow } from '@/types';
import type { OrdersCatalogValue } from '@/types/inertia-pages';

const noopReplaceVenueItem = (_row: OrderItemsRow) => {};

/** Defaults for slideout until GET /api/orders/{id} detail props ship. */
export function resolveSlideoutCatalog(catalog: OrdersCatalogValue) {
    return {
        tours: catalog.tours ?? [],
        tour_venue_status: catalog.tour_venue_status ?? [],
        tour_venue_stops: catalog.tour_venue_stops ?? [],
        tour_venue_demos: catalog.tour_venue_demos ?? [],
        venues: catalog.venues ?? [],
        _legacy_orders: catalog._legacy_orders ?? [],
        venue_items: catalog.venue_items ?? [],
        venue_item_assigned: catalog.venue_item_assigned ?? [],
        venue_item_notes: catalog.venue_item_notes ?? [],
        venue_item_language: catalog.venue_item_language ?? [],
        venue_item_encoding: catalog.venue_item_encoding ?? [],
        invoices: catalog.invoices ?? [],
        replaceVenueItem: catalog.replaceVenueItem ?? noopReplaceVenueItem,
    };
}
