import type { TourVenueStatusValue } from '@/types';
import type { ApiOrder, AwaitingAssetTag, OrderStatus } from '@/types/orders-api';

const ORDER_STATUS_TO_TOUR_VENUE_STATUS: Partial<
    Record<OrderStatus, TourVenueStatusValue>
> = {
    'New Order': 1,
    'In Progress': 2,
    'Client Review': 2,
    Complete: 7,
    Canceled: 6,
};

const AWAITING_ASSET_TO_STATUS: Record<AwaitingAssetTag, TourVenueStatusValue> =
    {
        'Voice Over': 3,
        Audio: 4,
        Art: 5,
    };

/** Map API order status + awaiting assets → legacy header StatusIconGroup ids. */
export function collectTourVenueStatuses(order: ApiOrder): TourVenueStatusValue[] {
    const set = new Set<TourVenueStatusValue>();

    const primary = ORDER_STATUS_TO_TOUR_VENUE_STATUS[order.status];
    if (primary !== undefined) {
        set.add(primary);
    }

    if (order.is_awaiting_assets) {
        for (const item of order.order_items ?? []) {
            const tags = item.specifications?.awaiting_assets;
            if (!Array.isArray(tags)) {
                continue;
            }
            for (const tag of tags) {
                const mapped = AWAITING_ASSET_TO_STATUS[tag as AwaitingAssetTag];
                if (mapped !== undefined) {
                    set.add(mapped);
                }
            }
        }
    }

    if (set.size === 0) {
        set.add(1);
    }

    return [...set];
}
