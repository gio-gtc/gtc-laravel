import { indexOrderMissingAssetTags } from '@/lib/orders/awaiting-asset-tags';
import { ORDER_MENU_CATEGORY_QUADRANTS } from '@/lib/orders/order-menu-categories';
import type { AssetTrackingMap, OrderItem } from '@/types/orders-api';
import type {
    ApiOrderWireStatus,
    IndexOrder,
    OrderStatusName,
    OrderStatusRef,
    OrderTag,
} from '@/types/orders-api';

const KNOWN_ORDER_STATUS_NAMES = new Set<OrderStatusName>([
    'New Order',
    'In Progress',
    'Client Review',
    'Complete',
    'Cancelled',
]);

const ORDER_TAG_SET = new Set<OrderTag>(['Art', 'Audio']);

type OrderBadgeSource = Pick<
    IndexOrder,
    'statuses' | 'tags' | 'status' | 'item_statuses' | 'order_items'
>;

type OrderItemLike = NonNullable<OrderBadgeSource['order_items']>[number];

function normalizeStatusName(name: string): string {
    if (name === 'Canceled') {
        return 'Cancelled';
    }
    return name;
}

function toStatusRef(name: string, id: number): OrderStatusRef {
    const normalized = normalizeStatusName(name);
    return {
        id,
        name: normalized as OrderStatusName,
    };
}

function statusesFromLegacyFields(order: OrderBadgeSource): OrderStatusRef[] {
    const fromItemStatuses = (order.item_statuses ?? [])
        .map(normalizeStatusName)
        .filter((name) => name !== 'Still In Cart');

    if (fromItemStatuses.length > 0) {
        const unique = [...new Set(fromItemStatuses)];
        return unique.map((name, index) => toStatusRef(name, index + 1));
    }

    const wireStatus = order.status;
    if (wireStatus && wireStatus !== 'Still In Cart') {
        return [toStatusRef(wireStatus, 1)];
    }

    return [];
}

function assetTrackingMapFromItem(item: OrderItemLike): AssetTrackingMap {
    if ('specifiable' in item && item.specifiable?.asset_tracking) {
        return item.specifiable.asset_tracking;
    }
    if ('asset_tracking' in item && item.asset_tracking) {
        return item.asset_tracking;
    }
    return {};
}

function tagsFromOrderItem(item: OrderItemLike): OrderTag[] {
    const found = new Set<OrderTag>();

    const wireType = (item as { type?: string }).type;
    if (wireType === 'Art' || wireType === 'Audio') {
        found.add(wireType);
    }

    const menuItem =
        'order_menu_item' in item
            ? (item as OrderItem).order_menu_item
            : undefined;
    const categoryId = menuItem?.order_menu_category_id;
    if (categoryId === ORDER_MENU_CATEGORY_QUADRANTS.keyArt) {
        found.add('Art');
    }
    if (categoryId === ORDER_MENU_CATEGORY_QUADRANTS.radio) {
        found.add('Audio');
    }

    for (const key of Object.keys(assetTrackingMapFromItem(item))) {
        if (ORDER_TAG_SET.has(key as OrderTag)) {
            found.add(key as OrderTag);
        }
    }

    return [...found];
}

function tagsFromOrderItems(order: OrderBadgeSource): OrderTag[] {
    const found = new Set<OrderTag>();
    for (const item of order.order_items ?? []) {
        for (const tag of tagsFromOrderItem(item)) {
            found.add(tag);
        }
    }
    return [...found];
}

function tagsFromMissingAssets(order: OrderBadgeSource): OrderTag[] {
    return indexOrderMissingAssetTags(order).filter((tag): tag is OrderTag =>
        ORDER_TAG_SET.has(tag as OrderTag),
    );
}

function mergeTags(...groups: OrderTag[][]): OrderTag[] {
    const found = new Set<OrderTag>();
    for (const group of groups) {
        for (const tag of group) {
            found.add(tag);
        }
    }
    return [...found];
}

/** Resolve badge props from API fields with legacy fallbacks during rollout. */
export function resolveOrderBadges(order: OrderBadgeSource): {
    statuses: OrderStatusRef[];
    tags: OrderTag[];
    usedLegacyFallback: boolean;
} {
    const apiStatuses = order.statuses ?? [];
    const apiTags = order.tags ?? [];

    const statuses =
        apiStatuses.length > 0
            ? apiStatuses
            : statusesFromLegacyFields(order);

    const tags = mergeTags(
        apiTags,
        tagsFromOrderItems(order),
        tagsFromMissingAssets(order),
    );

    const usedLegacyFallback =
        apiStatuses.length === 0 &&
        apiTags.length === 0 &&
        (statuses.length > 0 || tags.length > 0);

    return {
        statuses,
        tags,
        usedLegacyFallback,
    };
}

export function isKnownOrderStatusName(
    name: string,
): name is OrderStatusName {
    return KNOWN_ORDER_STATUS_NAMES.has(
        normalizeStatusName(name) as OrderStatusName,
    );
}

export type { ApiOrderWireStatus };
