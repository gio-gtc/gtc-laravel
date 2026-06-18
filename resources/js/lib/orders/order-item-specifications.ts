import { formatShortUsDate } from '@/lib/format/date';
import {
    durationWireFromSpecValue,
    encodingLabelsFromWire,
} from '@/lib/orders/broadcast-spec-wire';
import { ORDER_MENU_CATEGORY_QUADRANTS } from '@/lib/orders/order-menu-categories';
import type {
    ApiOrder,
    AssetTrackingMap,
    OrderItem,
    OrderItemStatus,
} from '@/types/orders-api';

export const BROADCAST_SPECIFIABLE_TYPE =
    'App\\Models\\OrderItemBroadcastSpecification';

export const SOCIAL_SPECIFIABLE_TYPE =
    'App\\Models\\OrderItemSocialSpecification';

export type OrderItemSpecRecord = Record<string, unknown>;

export function specString(specs: OrderItemSpecRecord, key: string): string {
    const value = specs[key];
    return typeof value === 'string' ? value.trim() : '';
}

export function isBroadcastOrderItem(item: OrderItem): boolean {
    if (item.specifiable_type === BROADCAST_SPECIFIABLE_TYPE) {
        return true;
    }
    return (
        item.order_menu_item?.order_menu_category_id ===
        ORDER_MENU_CATEGORY_QUADRANTS.broadcast
    );
}

export function isSocialOrderItem(item: OrderItem): boolean {
    if (item.specifiable_type === SOCIAL_SPECIFIABLE_TYPE) {
        return true;
    }
    return (
        item.order_menu_item?.order_menu_category_id ===
        ORDER_MENU_CATEGORY_QUADRANTS.social
    );
}

export function orderItemSpecRecord(item: OrderItem): OrderItemSpecRecord {
    if (
        item.specifiable != null &&
        (isBroadcastOrderItem(item) || isSocialOrderItem(item))
    ) {
        return item.specifiable as OrderItemSpecRecord;
    }
    return (item.specifications ?? {}) as OrderItemSpecRecord;
}

export function normalizeOrderItemWireStatus(
    status: string | undefined,
): OrderItemStatus | undefined {
    if (!status) {
        return undefined;
    }
    if (status === 'Canceled') {
        return 'Cancelled';
    }
    return status as OrderItemStatus;
}

export function orderItemWireStatus(item: OrderItem): OrderItemStatus {
    const fromLookup = normalizeOrderItemWireStatus(item.status_lookup?.name);
    if (fromLookup) {
        return fromLookup;
    }
    const legacy = normalizeOrderItemWireStatus(item.status);
    if (legacy) {
        return legacy;
    }
    return 'Still In Cart';
}

export function orderItemAssetTracking(item: OrderItem): AssetTrackingMap {
    const specs = orderItemSpecRecord(item);
    const tracking = specs.asset_tracking;
    if (tracking != null && typeof tracking === 'object') {
        return tracking as AssetTrackingMap;
    }
    return {};
}

export function missingAssetTagsFromTrackingMap(
    tracking: AssetTrackingMap,
): string[] {
    return Object.entries(tracking)
        .filter(([, value]) => value === false)
        .map(([tag]) => tag);
}

export function missingAssetTagsFromItem(item: OrderItem): string[] {
    return missingAssetTagsFromTrackingMap(orderItemAssetTracking(item));
}

export function aggregateMissingAssetTags(
    order: Pick<ApiOrder, 'order_items'>,
): string[] {
    const tags = new Set<string>();
    for (const item of order.order_items ?? []) {
        for (const tag of missingAssetTagsFromItem(item)) {
            tags.add(tag);
        }
    }
    return [...tags];
}

export function initialAssetTrackingFromCatalogTags(
    tags: string[] | undefined,
): AssetTrackingMap {
    if (!tags?.length) {
        return {};
    }
    return Object.fromEntries(tags.map((tag) => [tag, false]));
}

export function orderItemDurationWire(specs: OrderItemSpecRecord): string {
    return durationWireFromSpecValue(specs.duration_seconds);
}

/** Whole seconds when wire value is a plain integer string or legacy number. */
export function orderItemDurationSeconds(specs: OrderItemSpecRecord): number {
    const wire = orderItemDurationWire(specs);
    if (/^\d+$/.test(wire)) {
        return Number.parseInt(wire, 10);
    }
    if (typeof specs.duration_seconds === 'number') {
        return specs.duration_seconds;
    }
    return 0;
}

export function orderItemEncodingLabels(specs: OrderItemSpecRecord): string[] {
    const fromArray = encodingLabelsFromWire(specs.encoding);
    if (fromArray.length > 0) {
        return fromArray;
    }
    const legacyCustom = specString(specs, 'encoding_custom');
    if (legacyCustom) {
        return [legacyCustom];
    }
    return encodingLabelsFromWire(specs.encoding);
}

export function parseOrderItemDimensions(
    specs: OrderItemSpecRecord,
): { width: number; height: number } {
    const raw =
        specString(specs, 'dimensions') ||
        (specString(specs, 'type').includes('×') ? specString(specs, 'type') : '');

    const match = raw.match(/(\d+)\s*[x×]\s*(\d+)/i);
    if (match) {
        return { width: Number(match[1]), height: Number(match[2]) };
    }

    const width = typeof specs.width === 'number' ? specs.width : 0;
    const height = typeof specs.height === 'number' ? specs.height : 0;

    return { width, height };
}

export function orderItemCutLabel(item: OrderItem): string {
    const menuName = item.order_menu_item?.name?.trim() ?? '';
    const specs = orderItemSpecRecord(item);
    const specType = specString(specs, 'type');
    const specDimensions = specString(specs, 'dimensions');

    const parts = [menuName];
    if (specType && specType !== menuName) {
        parts.push(specType);
    }
    if (specDimensions) {
        parts.push(specDimensions);
    }

    return parts.filter(Boolean).join(' · ') || menuName || `Item ${item.id}`;
}

/** Display due date for table/venue row (M/d/yy or em dash). */
export function orderItemDueDateDisplay(item: OrderItem): string {
    if (!item.due_date) {
        return '—';
    }
    return formatShortUsDate(item.due_date);
}

export function orderItemIsci(item: OrderItem): string {
    return specString(orderItemSpecRecord(item), 'isci');
}

export function orderItemDefaultCut(item: OrderItem): string {
    const cut = specString(orderItemSpecRecord(item), 'cut');
    if (cut) {
        return cut;
    }
    return orderItemCutLabel(item);
}

/** Missing tags from a lean index row when full OrderItem is unavailable. */
export function missingAssetTagsFromLeanItem(item: {
    asset_tracking?: AssetTrackingMap;
    specifiable?: { asset_tracking?: AssetTrackingMap };
}): string[] {
    const tracking =
        item.asset_tracking ??
        item.specifiable?.asset_tracking ??
        ({} as AssetTrackingMap);
    return missingAssetTagsFromTrackingMap(tracking);
}

export function aggregateMissingAssetTagsFromIndex(order: {
    order_items?: Array<
        | OrderItem
        | {
              asset_tracking?: AssetTrackingMap;
              specifiable?: { asset_tracking?: AssetTrackingMap };
          }
    >;
}): string[] {
    const tags = new Set<string>();
    for (const item of order.order_items ?? []) {
        const itemTags =
            'order_menu_item_id' in item || 'specifiable_type' in item
                ? missingAssetTagsFromItem(item as OrderItem)
                : missingAssetTagsFromLeanItem(item);
        for (const tag of itemTags) {
            tags.add(tag);
        }
    }
    return [...tags];
}
