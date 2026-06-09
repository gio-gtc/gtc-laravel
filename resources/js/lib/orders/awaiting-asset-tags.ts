import {
    aggregateMissingAssetTags,
    aggregateMissingAssetTagsFromIndex,
} from '@/lib/orders/order-item-specifications';
import type {
    ApiOrder,
    AssetTrackingMap,
    AwaitingAssetTag,
    OrderItem,
} from '@/types/orders-api';

/** Union of missing asset tags across all lines on an order (heavy show). */
export function aggregateAwaitingAssetTags(
    order: Pick<ApiOrder, 'order_items'>,
): AwaitingAssetTag[] {
    return aggregateMissingAssetTags(order) as AwaitingAssetTag[];
}

/** Missing asset tags for orders index rows (lean or heavy items). */
export function indexOrderMissingAssetTags(order: {
    order_items?: Array<
        | OrderItem
        | {
              asset_tracking?: AssetTrackingMap;
              specifiable?: { asset_tracking?: AssetTrackingMap };
          }
    >;
}): string[] {
    return aggregateMissingAssetTagsFromIndex(order);
}
