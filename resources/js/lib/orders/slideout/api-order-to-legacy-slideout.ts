import {
    formatOrderShowDatesForHeader,
    orderShowDateRange,
} from '@/lib/orders/format-order-show-dates';
import {
    missingAssetTagsFromItem,
    orderItemAssetTracking,
    orderItemCutLabel,
    orderItemDefaultCut,
    orderItemDueDateDisplay,
    orderItemDurationSeconds,
    orderItemDurationWire,
    orderItemEncodingLabels,
    orderItemIsci,
    orderItemSpecRecord,
    orderItemWireStatus,
    parseOrderItemDimensions,
    specString,
} from '@/lib/orders/order-item-specifications';
import { primaryEncodingLabel } from '@/lib/orders/broadcast-spec-wire';
import {
    defaultArtPackage,
    defaultAudioSpotType,
    defaultBroadcastSpotType,
    defaultSocialCut,
    defaultSocialSpotType,
} from '@/lib/orders/order-item-venue-defaults';
import { venueItemTypeFromCategoryId } from '@/lib/orders/order-menu-categories';
import type {
    OrderItemAssigned,
    OrderItemsArtRow,
    OrderItemsBroadcastRow,
    OrderItemsRadioRow,
    OrderItemsRow,
    OrderItemsSocialRow,
    Tour,
    TourVenue,
    Venue,
} from '@/types';
import type { OrdersSlideoutCatalogExtensions } from '@/types/inertia-pages';
import type { ApiOrder, ApiOrderVenue, OrderItem } from '@/types/orders-api';

const DEFAULT_COUNTRY_ID = 1;

export type LegacySlideoutPayload = {
    tour: Tour;
    venueItem: { orderVenue: TourVenue; venue: Venue | null };
    eventDates: string | undefined;
    catalogExtensions: Pick<
        OrdersSlideoutCatalogExtensions,
        'venue_items' | 'venue_item_assigned'
    >;
};

function dateOnly(value: string | null | undefined): string {
    if (!value) {
        return new Date().toISOString().slice(0, 10);
    }
    return value.split('T')[0];
}

function apiVenueToLegacy(venue: ApiOrderVenue): Venue {
    return {
        id: venue.id,
        name: venue.name,
        address: '',
        city: venue.city,
        state: venue.state,
        country_id: DEFAULT_COUNTRY_ID,
    };
}

function apiOrderToTour(order: ApiOrder): Tour {
    const due = dateOnly(order.due_date ?? order.created_at);

    return {
        id: order.tour_id,
        name: order.tour?.name ?? `Tour ${order.tour_id}`,
        performer: '',
        owner_contact_id: order.client?.id ?? order.ordered_by_id ?? 0,
        date_started: due,
        created_at: order.created_at,
        live: 0,
        require_owner_approval: 0,
        special_instructions: null,
        gtc_rep_contact_id: 0,
        high_def_only: 0,
        due_date: due,
    };
}

function apiOrderToTourVenue(order: ApiOrder): TourVenue {
    const { start, end } = orderShowDateRange(order);

    return {
        id: order.id,
        tour_id: order.tour_id,
        venue_id: order.venue_id,
        demo_uuid: order.is_demo ? order.uuid : null,
        start_date: start,
        end_date: end,
        client: order.client?.id ?? order.ordered_by_id ?? 0,
        created_at: order.created_at,
        status: null,
    };
}

function baseRowFields(
    order: ApiOrder,
    item: OrderItem,
): Pick<OrderItemsRow, 'id' | 'tour_venue_id' | 'dueDate' | 'created_date'> {
    return {
        id: String(item.id),
        tour_venue_id: order.id,
        dueDate: orderItemDueDateDisplay(item),
        created_date: item.created_at,
    };
}

function orderItemAssetPath(item: OrderItem): string | undefined {
    const path = item.asset_path?.trim();
    return path || undefined;
}

export function mapApiOrderItemToVenueRow(
    order: ApiOrder,
    item: OrderItem,
): OrderItemsRow | null {
    const venueType = venueItemTypeFromCategoryId(
        item.order_menu_item?.order_menu_category_id,
    );
    if (!venueType) {
        return null;
    }

    const isci = orderItemIsci(item);
    const statusId = item.order_item_status_id;
    const wireStatus = orderItemWireStatus(item);
    const hasDeliverables =
        wireStatus === 'Client Review' || wireStatus === 'Out For Delivery';
    const base = baseRowFields(order, item);
    const assetPath = orderItemAssetPath(item);

    if (venueType === 'broadcast') {
        const specs = orderItemSpecRecord(item);
        const durationWire = orderItemDurationWire(specs);
        const encodingLabels = orderItemEncodingLabels(specs);
        const assetTracking = orderItemAssetTracking(item);
        const row: OrderItemsBroadcastRow = {
            ...base,
            type: 'broadcast',
            isci,
            duration_seconds: durationWire,
            status_id: statusId,
            spot_type: defaultBroadcastSpotType(specs),
            cut: orderItemDefaultCut(item) as OrderItemsBroadcastRow['cut'],
            language: specString(specs, 'language') || undefined,
            encoding: encodingLabels.length > 0 ? encodingLabels : undefined,
            encoding_label:
                encodingLabels.length > 0
                    ? primaryEncodingLabel(encodingLabels)
                    : undefined,
            asset_tracking: assetTracking,
            missingAssetTags: missingAssetTagsFromItem(item),
            has_deliverable_actions: hasDeliverables,
            asset_path: assetPath,
            order_id: order.id,
        };
        return row;
    }

    const specs = item.specifications ?? {};

    if (venueType === 'social') {
        const row: OrderItemsSocialRow = {
            ...base,
            type: 'social',
            isci,
            duration_seconds: orderItemDurationSeconds(specs as Record<string, unknown>),
            status_id: statusId,
            spot_type: defaultSocialSpotType(specs as Record<string, unknown>),
            cut: defaultSocialCut(specs as Record<string, unknown>),
            has_deliverable_actions: hasDeliverables,
            asset_path: assetPath,
            order_id: order.id,
        };
        return row;
    }

    if (venueType === 'radio') {
        const row: OrderItemsRadioRow = {
            ...base,
            type: 'radio',
            isci,
            duration_seconds: orderItemDurationSeconds(specs as Record<string, unknown>),
            status_id: statusId,
            spot_type: defaultAudioSpotType(specs as Record<string, unknown>),
            cut: orderItemDefaultCut(item) as OrderItemsRadioRow['cut'],
            has_deliverable_actions: hasDeliverables,
            asset_path: assetPath,
            order_id: order.id,
        };
        return row;
    }

    if (venueType === 'art') {
        const { width, height } = parseOrderItemDimensions(
            specs as Record<string, unknown>,
        );
        const row: OrderItemsArtRow = {
            ...base,
            type: 'art',
            package_type: defaultArtPackage(specs as Record<string, unknown>),
            label: orderItemCutLabel(item),
            width,
            height,
            status_id: statusId,
            has_deliverable_actions: hasDeliverables,
            order_id: order.id,
        };
        return row;
    }

    return null;
}

function orderItemsToVenueItems(order: ApiOrder): OrderItemsRow[] {
    const rows: OrderItemsRow[] = [];

    for (const item of order.order_items ?? []) {
        const row = mapApiOrderItemToVenueRow(order, item);
        if (row) {
            rows.push(row);
        }
    }

    return rows;
}

function orderItemsToAssigned(order: ApiOrder): OrderItemAssigned[] {
    const assigned: OrderItemAssigned[] = [];
    let assignId = 1;

    for (const item of order.order_items ?? []) {
        for (const person of item.assignees ?? []) {
            assigned.push({
                id: assignId++,
                venue_item_id: String(item.id),
                mockUser_id: person.id,
            });
        }
    }

    return assigned;
}

export function apiOrderToLegacySlideout(
    order: ApiOrder,
): LegacySlideoutPayload {
    const venue = order.venue != null ? apiVenueToLegacy(order.venue) : null;

    return {
        tour: apiOrderToTour(order),
        venueItem: {
            orderVenue: apiOrderToTourVenue(order),
            venue,
        },
        eventDates: formatOrderShowDatesForHeader(order.show_dates),
        catalogExtensions: {
            venue_items: orderItemsToVenueItems(order),
            venue_item_assigned: orderItemsToAssigned(order),
        },
    };
}
