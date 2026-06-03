import type { VenueItemsRow } from '@/types';
import type { ApiOrder, OrderItem } from '@/types/orders-api';

export function upsertOrderItem(
    order: ApiOrder,
    created: OrderItem,
): ApiOrder {
    const items = [...(order.order_items ?? [])];
    const index = items.findIndex((i) => i.id === created.id);
    if (index >= 0) {
        items[index] = created;
    } else {
        items.push(created);
    }
    return { ...order, order_items: items };
}

export function replaceOrderItemInOrder(
    order: ApiOrder,
    row: VenueItemsRow,
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
            specifications: {
                ...item.specifications,
                isci: 'isci' in row ? row.isci : item.specifications.isci,
            },
        };
    });
    return { ...order, order_items: items };
}
