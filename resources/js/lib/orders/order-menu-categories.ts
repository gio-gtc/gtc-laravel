import type { OrderItemsRowType } from '@/types';
import type { ApiOrder, OrderMenuCategoryId } from '@/types/orders-api';

export const ORDER_MENU_CATEGORY_QUADRANTS = {
    broadcast: 1,
    social: 2,
    radio: 3,
    keyArt: 4,
} as const satisfies Record<string, OrderMenuCategoryId>;

export const ORDER_MENU_CATEGORY_TITLES: Record<OrderMenuCategoryId, string> = {
    1: 'Broadcast & Streaming Video',
    2: 'Social Video',
    3: 'Radio',
    4: 'Key Art & Static Assets',
};

/** Interim defaults until GET order menu ships on the orders page. */
export const DEFAULT_ORDER_MENU_ITEM_ID_BY_CATEGORY: Record<
    OrderMenuCategoryId,
    number
> = {
    1: 1,
    2: 4,
    3: 7,
    4: 10,
};

export function orderItemTypeFromCategoryId(
    categoryId: OrderMenuCategoryId | undefined,
): OrderItemsRowType | null {
    switch (categoryId) {
        case ORDER_MENU_CATEGORY_QUADRANTS.broadcast:
            return 'broadcast';
        case ORDER_MENU_CATEGORY_QUADRANTS.social:
            return 'social';
        case ORDER_MENU_CATEGORY_QUADRANTS.radio:
            return 'radio';
        case ORDER_MENU_CATEGORY_QUADRANTS.keyArt:
            return 'art';
        default:
            return null;
    }
}

export function categoryIdFromVenueItemType(
    type: OrderItemsRowType,
): OrderMenuCategoryId | null {
    switch (type) {
        case 'broadcast':
            return ORDER_MENU_CATEGORY_QUADRANTS.broadcast;
        case 'social':
            return ORDER_MENU_CATEGORY_QUADRANTS.social;
        case 'radio':
            return ORDER_MENU_CATEGORY_QUADRANTS.radio;
        case 'art':
            return ORDER_MENU_CATEGORY_QUADRANTS.keyArt;
        default:
            return null;
    }
}

export function defaultOrderMenuItemIdForCategory(
    order: ApiOrder,
    categoryId: OrderMenuCategoryId,
): number | null {
    const match = (order.order_items ?? []).find(
        (item) => item.order_menu_item?.order_menu_category_id === categoryId,
    );
    if (match) {
        return match.order_menu_item_id;
    }

    return DEFAULT_ORDER_MENU_ITEM_ID_BY_CATEGORY[categoryId] ?? null;
}
