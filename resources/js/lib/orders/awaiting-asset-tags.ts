import type { ApiOrder, AwaitingAssetTag } from '@/types/orders-api';

/** Union of item-level asset blocker tags (replaces removed root `awaiting_assets`). */
export function aggregateAwaitingAssetTags(
    order: Pick<ApiOrder, 'order_items'>,
): AwaitingAssetTag[] {
    const tags = new Set<AwaitingAssetTag>();

    for (const item of order.order_items ?? []) {
        for (const tag of item.specifications.awaiting_assets ?? []) {
            tags.add(tag);
        }
    }

    return [...tags];
}
