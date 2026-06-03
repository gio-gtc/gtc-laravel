import { formatOrderShowDatesForHeader, orderShowDateRange } from '@/lib/orders/format-order-show-dates';
import {
    defaultArtPackage,
    defaultBroadcastSpotType,
    defaultSocialCut,
    defaultSocialSpotType,
} from '@/lib/orders/order-item-venue-defaults';
import {
    orderItemDefaultCut,
    orderItemDueDateDisplay,
    orderItemDurationSeconds,
    orderItemIsci,
    orderItemCutLabel,
    parseOrderItemDimensions,
} from '@/lib/orders/order-item-specifications';
import { venueItemTypeFromCategoryId } from '@/lib/orders/order-menu-categories';
import { collectTourVenueStatuses } from '@/lib/orders/order-status-tour-venue-icons';
import type {
    Tour,
    TourVenue,
    Venue,
    VenueItemAssigned,
    VenueItemsArtRow,
    VenueItemsBroadcastRow,
    VenueItemsRadioRow,
    VenueItemsRow,
    VenueItemsSocialRow,
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
        status: collectTourVenueStatuses(order),
    };
}

function baseRowFields(
    order: ApiOrder,
    item: OrderItem,
): Pick<VenueItemsRow, 'id' | 'tour_venue_id' | 'dueDate' | 'created_date'> {
    return {
        id: String(item.id),
        tour_venue_id: order.id,
        dueDate: orderItemDueDateDisplay(item),
        created_date: item.created_at,
    };
}

function orderItemToVenueRow(
    order: ApiOrder,
    item: OrderItem,
): VenueItemsRow | null {
    const venueType = venueItemTypeFromCategoryId(
        item.order_menu_item?.order_menu_category_id,
    );
    if (!venueType) {
        return null;
    }

    const isci = orderItemIsci(item);
    const statusId = item.order_item_status_id;
    const hasDeliverables = item.status === 'Client Review';
    const base = baseRowFields(order, item);
    const specs = item.specifications;

    if (venueType === 'broadcast') {
        const row: VenueItemsBroadcastRow = {
            ...base,
            type: 'broadcast',
            isci,
            duration_seconds: orderItemDurationSeconds(specs),
            status_id: statusId,
            spot_type: defaultBroadcastSpotType(specs),
            cut: orderItemDefaultCut(item) as VenueItemsBroadcastRow['cut'],
            has_deliverable_actions: hasDeliverables,
            order_id: order.id,
        };
        return row;
    }

    if (venueType === 'social') {
        const row: VenueItemsSocialRow = {
            ...base,
            type: 'social',
            isci,
            duration_seconds: orderItemDurationSeconds(specs),
            status_id: statusId,
            spot_type: defaultSocialSpotType(specs),
            cut: defaultSocialCut(specs),
            has_deliverable_actions: hasDeliverables,
            order_id: order.id,
        };
        return row;
    }

    if (venueType === 'radio') {
        const row: VenueItemsRadioRow = {
            ...base,
            type: 'radio',
            isci,
            duration_seconds: orderItemDurationSeconds(specs),
            status_id: statusId,
            spot_type: defaultBroadcastSpotType(specs),
            cut: orderItemDefaultCut(item) as VenueItemsRadioRow['cut'],
            has_deliverable_actions: hasDeliverables,
            order_id: order.id,
        };
        return row;
    }

    if (venueType === 'art') {
        const { width, height } = parseOrderItemDimensions(specs);
        const row: VenueItemsArtRow = {
            ...base,
            type: 'art',
            package_type: defaultArtPackage(specs),
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

function orderItemsToVenueItems(order: ApiOrder): VenueItemsRow[] {
    const rows: VenueItemsRow[] = [];

    for (const item of order.order_items ?? []) {
        const row = orderItemToVenueRow(order, item);
        if (row) {
            rows.push(row);
        }
    }

    return rows;
}

function orderItemsToAssigned(order: ApiOrder): VenueItemAssigned[] {
    const assigned: VenueItemAssigned[] = [];
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

export function apiOrderToLegacySlideout(order: ApiOrder): LegacySlideoutPayload {
    const venue =
        order.venue != null ? apiVenueToLegacy(order.venue) : null;

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
