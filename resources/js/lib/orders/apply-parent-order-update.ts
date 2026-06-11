import { mergeApiOrderUpdate } from '@/lib/orders/merge-api-order-update';
import type { ApiOrder, ParentOrderUpdate } from '@/types/orders-api';

/** Merge cascading parent badge fields from a line-item mutation snapshot. */
export function applyParentOrderUpdate(
    order: ApiOrder,
    patch: ParentOrderUpdate,
): ApiOrder {
    if (order.id !== patch.id) {
        return order;
    }

    return mergeApiOrderUpdate(order, {
        id: patch.id,
        statuses: patch.statuses,
        tags: patch.tags,
        updated_at: patch.updated_at,
    } as ApiOrder);
}
