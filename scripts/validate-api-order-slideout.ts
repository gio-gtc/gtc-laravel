/**
 * Smoke tests for apiOrderToLegacySlideout. Run: npx tsx scripts/validate-api-order-slideout.ts
 */
import {
    apiOrderToLegacySlideout,
    mergeSlideoutVenueItems,
} from '../resources/js/lib/orders/slideout/index.ts';
import type { ApiOrder } from '../resources/js/types/orders-api.ts';

function assert(condition: boolean, message: string): void {
    if (!condition) {
        throw new Error(message);
    }
}

const sampleOrder: ApiOrder = {
    id: 1,
    uuid: '550e8400-e29b-41d4-a716-446655440000',
    tour_id: 12,
    venue_id: 84,
    ordered_by_id: 4,
    is_demo: false,
    local_deliverable_email: 'client@example.com',
    submitted_at: '2026-05-27T20:00:00.000000Z',
    due_date: '2026-10-15',
    created_at: '2026-05-27T20:00:00.000000Z',
    updated_at: '2026-05-27T20:00:00.000000Z',
    status: 'New Order',
    item_statuses: ['Still In Cart'],
    is_awaiting_assets: false,
    tour: { id: 12, name: 'Eras Tour 2026' },
    venue: {
        id: 84,
        name: 'SoFi Stadium',
        city: 'Inglewood',
        state: 'CA',
        country_code: 'US',
    },
    client: {
        id: 4,
        first_name: 'Live',
        last_name: 'Nation',
        email: 'hq@livenation.com',
        organisation_id: 3,
        organisation: { id: 3, name: 'Live Nation HQ' },
    },
    show_dates: [{ id: 1, order_id: 1, show_date: '2026-10-15' }],
    order_items: [
        {
            id: 142,
            order_id: 1,
            order_menu_item_id: 4,
            order_item_status_id: 1,
            locked_price: '150.00',
            status: 'Still In Cart',
            due_date: '2026-10-15',
            created_at: '2026-05-27T20:00:00.000000Z',
            updated_at: '2026-05-27T20:00:00.000000Z',
            specifications: { isci: 'GTC000142' },
            root_order_item_id: null,
            revision_number: 1,
            supersedes_order_item_id: null,
            invoice_line_id: null,
            order_menu_item: {
                id: 4,
                name: '15s Social Teaser',
                order_menu_category_id: 2,
            },
            assignees: [{ id: 9, email: 'alex@gtcforce.com', name: 'Alex Editor' }],
        },
    ],
};

const payload = apiOrderToLegacySlideout(sampleOrder);

assert(payload.tour.id === 12, 'tour id');
assert(payload.tour.name === 'Eras Tour 2026', 'tour name');
assert(payload.venueItem.orderVenue.id === 1, 'tour venue id uses order id');
assert(payload.venueItem.venue?.name === 'SoFi Stadium', 'venue name');
assert(
    payload.catalogExtensions.venue_items?.length === 1,
    'one venue item',
);
assert(
    payload.catalogExtensions.venue_items?.[0]?.type === 'social',
    'social quadrant',
);
assert(
    payload.catalogExtensions.venue_item_assigned?.length === 1,
    'one assignee',
);
assert(
    payload.eventDates?.includes('October') === true,
    'formatted event dates',
);

const merged = mergeSlideoutVenueItems(payload.catalogExtensions.venue_items ?? [], [
    {
        id: 'loc-1',
        tour_venue_id: 99,
        type: 'localized',
        dueDate: '1/1/26',
        created_date: '2026-01-01T00:00:00.000Z',
        label: 'Mock',
        width: 100,
        height: 100,
        cta: 'Buy',
    },
]);
assert(merged.length === 2, 'merged localized row');

console.log('api-order-to-legacy-slideout: ok');
