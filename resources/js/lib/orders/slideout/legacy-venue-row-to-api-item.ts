import {
    categoryIdFromVenueItemType,
    defaultOrderMenuItemIdForCategory,
} from '@/lib/orders/order-menu-categories';
import type {
    OrderItemsArtRow,
    OrderItemsBroadcastRadioSocialRow,
    OrderItemsRow,
} from '@/types';
import type { ApiOrder } from '@/types/orders-api';

export type StoreOrderItemPayload = {
    order_menu_item_id: number;
    due_date: string;
    specifications: Record<string, unknown>;
    assignee_ids?: number[];
};

export function dueDateIso(order: ApiOrder, row: OrderItemsRow): string {
    if (row.dueDate && row.dueDate !== '—') {
        const parsed = Date.parse(row.dueDate);
        if (!Number.isNaN(parsed)) {
            return new Date(parsed).toISOString().slice(0, 10);
        }
    }
    return (
        order.due_date?.split('T')[0] ?? new Date().toISOString().slice(0, 10)
    );
}

function mediaSpecifications(
    row: OrderItemsBroadcastRadioSocialRow,
): Record<string, unknown> {
    return {
        isci: row.isci,
        type: row.spot_type,
        cut: row.cut,
        duration_seconds: row.duration_seconds,
    };
}

function artSpecifications(row: OrderItemsArtRow): Record<string, unknown> {
    return {
        type: row.package_type,
        dimensions:
            row.width > 0 && row.height > 0
                ? `${row.width}x${row.height}`
                : row.label,
    };
}

/**
 * Map a legacy venue_items row to POST /api/orders/{id}/items body.
 * Returns null when the row type cannot be created via API (e.g. localized).
 */
export function venueRowToStoreItemPayload(
    row: OrderItemsRow,
    order: ApiOrder,
): StoreOrderItemPayload | null {
    const categoryId = categoryIdFromVenueItemType(row.type);
    if (categoryId === null) {
        return null;
    }

    const orderMenuItemId = defaultOrderMenuItemIdForCategory(
        order,
        categoryId,
    );
    if (orderMenuItemId === null) {
        return null;
    }

    const specifications =
        row.type === 'art'
            ? artSpecifications(row)
            : mediaSpecifications(row as OrderItemsBroadcastRadioSocialRow);

    return {
        order_menu_item_id: orderMenuItemId,
        due_date: dueDateIso(order, row),
        specifications,
    };
}
