import type { OrderItemBulkPatch } from '@/lib/orders/order-item-adapters/types';
import type { OrderItemsRow } from '@/types';
import type { ApiOrder, OrderItem } from '@/types/orders-api';
import {
    isBroadcastOrderItem,
    isRadioOrderItem,
    isSocialOrderItem,
    orderItemSpecRecord,
} from '@/lib/orders/order-item-specifications';

export function upsertOrderItem(order: ApiOrder, created: OrderItem): ApiOrder {
    const items = [...(order.order_items ?? [])];
    const index = items.findIndex((i) => i.id === created.id);
    if (index >= 0) {
        items[index] = created;
    } else {
        items.push(created);
    }
    return { ...order, order_items: items };
}

export function removeOrderItemFromOrder(
    order: ApiOrder,
    orderItemId: number,
): ApiOrder {
    return {
        ...order,
        order_items: (order.order_items ?? []).filter(
            (item) => item.id !== orderItemId,
        ),
    };
}

export function replaceOrderItemInOrder(
    order: ApiOrder,
    row: OrderItemsRow,
): ApiOrder {
    const items = (order.order_items ?? []).map((item) => {
        if (String(item.id) !== String(row.id)) {
            return item;
        }
        return {
            ...item,
            due_date: row.dueDate === '—' ? null : item.due_date,
            order_item_status_id:
                'status_id' in row ? row.status_id : item.order_item_status_id,
        };
    });
    return { ...order, order_items: items };
}

/** Merge partial specification fields onto matching order items (optimistic inline edit). */
export function patchOrderItemSpecificationsInOrder(
    order: ApiOrder,
    orderItemIds: number[],
    specifications: Record<string, unknown>,
): ApiOrder {
    if (orderItemIds.length === 0 || Object.keys(specifications).length === 0) {
        return order;
    }

    const idSet = new Set(orderItemIds.map((id) => Number(id)));
    const items = (order.order_items ?? []).map((item) => {
        if (!idSet.has(item.id)) {
            return item;
        }

        if (
            item.specifiable != null &&
            (isBroadcastOrderItem(item) ||
                isSocialOrderItem(item) ||
                isRadioOrderItem(item))
        ) {
            return {
                ...item,
                specifiable: {
                    ...(item.specifiable as Record<string, unknown>),
                    ...specifications,
                },
            };
        }

        const existingSpecs = orderItemSpecRecord(item);
        return {
            ...item,
            specifications: {
                ...existingSpecs,
                ...specifications,
            },
        };
    });

    return { ...order, order_items: items };
}

/** Apply bulk-write fields onto matching order items (optimistic modal/inline edit). */
export function patchOrderItemsBulkInOrder(
    order: ApiOrder,
    orderItemIds: number[],
    patch: OrderItemBulkPatch,
): ApiOrder {
    if (orderItemIds.length === 0) {
        return order;
    }

    if (patch.specifications && Object.keys(patch.specifications).length > 0) {
        return patchOrderItemSpecificationsInOrder(
            order,
            orderItemIds,
            patch.specifications,
        );
    }

    const idSet = new Set(orderItemIds.map((id) => Number(id)));
    const items = (order.order_items ?? []).map((item) => {
        if (!idSet.has(item.id)) {
            return item;
        }

        return {
            ...item,
            ...(patch.due_date !== undefined
                ? { due_date: patch.due_date }
                : {}),
            ...(patch.order_item_status_id !== undefined
                ? { order_item_status_id: patch.order_item_status_id }
                : {}),
        };
    });

    return { ...order, order_items: items };
}
