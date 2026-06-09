import { aggregateMissingAssetTags } from '@/lib/orders/order-item-specifications';
import type { TourVenueStatusValue } from '@/types';
import type {
    ApiOrder,
    ApiOrderWireStatus,
    AwaitingAssetTag,
} from '@/types/orders-api';

const ORDER_STATUS_TO_TOUR_VENUE_STATUS: Partial<
    Record<ApiOrderWireStatus, TourVenueStatusValue>
> = {
    'New Order': 1,
    'In Progress': 2,
    'Client Review': 2,
    Complete: 7,
    Canceled: 6,
};

/** Order waterfall status for header icons — canonical key is `Canceled`, not line-item `Cancelled`. */
function orderWireStatusForTourVenueLookup(
    status: ApiOrderWireStatus | string,
): ApiOrderWireStatus {
    if (status === 'Cancelled') {
        return 'Canceled';
    }
    return status as ApiOrderWireStatus;
}

const AWAITING_ASSET_TO_STATUS: Record<AwaitingAssetTag, TourVenueStatusValue> =
    {
        'Voice Over': 3,
        Audio: 4,
        Art: 5,
    };

/** Map API order status + missing asset tags → legacy header StatusIconGroup ids. */
export function collectTourVenueStatuses(
    order: ApiOrder,
): TourVenueStatusValue[] {
    const set = new Set<TourVenueStatusValue>();

    const primary =
        ORDER_STATUS_TO_TOUR_VENUE_STATUS[
            orderWireStatusForTourVenueLookup(order.status)
        ];
    if (primary !== undefined) {
        set.add(primary);
    }

    for (const tag of aggregateMissingAssetTags(order)) {
        const mapped = AWAITING_ASSET_TO_STATUS[tag as AwaitingAssetTag];
        if (mapped !== undefined) {
            set.add(mapped);
        }
    }

    if (set.size === 0) {
        set.add(1);
    }

    return [...set];
}
