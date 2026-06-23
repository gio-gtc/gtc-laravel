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

export const SOCIAL_SPECIFIABLE_TYPE = 'App\\Models\\OrderItemSocialSpecs';

/** @deprecated Legacy FQCN — still accepted in `isSocialOrderItem`. */
export const SOCIAL_SPECIFIABLE_TYPE_LEGACY =
    'App\\Models\\OrderItemSocialSpecification';

export const RADIO_SPECIFIABLE_TYPE =
    'App\\Models\\OrderItemRadioSpecification';

export const KEY_ART_SPECIFIABLE_TYPE = 'OrderItemKeyArtSpecs';

/** Optional FQCN if gtc-api ever emits the full class name. */
export const KEY_ART_SPECIFIABLE_TYPE_FQCN =
    'App\\Models\\OrderItemKeyArtSpecs';

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
    if (
        item.specifiable_type === SOCIAL_SPECIFIABLE_TYPE ||
        item.specifiable_type === SOCIAL_SPECIFIABLE_TYPE_LEGACY
    ) {
        return true;
    }
    return (
        item.order_menu_item?.order_menu_category_id ===
        ORDER_MENU_CATEGORY_QUADRANTS.social
    );
}

export function isRadioOrderItem(item: OrderItem): boolean {
    if (item.specifiable_type === RADIO_SPECIFIABLE_TYPE) {
        return true;
    }
    return (
        item.order_menu_item?.order_menu_category_id ===
        ORDER_MENU_CATEGORY_QUADRANTS.radio
    );
}

export function isKeyArtOrderItem(item: OrderItem): boolean {
    if (
        item.specifiable_type === KEY_ART_SPECIFIABLE_TYPE ||
        item.specifiable_type === KEY_ART_SPECIFIABLE_TYPE_FQCN
    ) {
        return true;
    }
    return (
        item.order_menu_item?.order_menu_category_id ===
        ORDER_MENU_CATEGORY_QUADRANTS.keyArt
    );
}

export function orderItemSpecRecord(item: OrderItem): OrderItemSpecRecord {
    if (
        item.specifiable != null &&
        (isBroadcastOrderItem(item) ||
            isSocialOrderItem(item) ||
            isRadioOrderItem(item) ||
            isKeyArtOrderItem(item))
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

export function orderHasStillInCartItems(
    order: ApiOrder | null | undefined,
): boolean {
    return (order?.order_items ?? []).some(
        (item) => orderItemWireStatus(item) === 'Still In Cart',
    );
}

export type OrderCartBillingLine = {
    id: number;
    reference: string;
    amount: number;
};

export function orderItemLockedPriceAmount(item: OrderItem): number {
    const raw = item.locked_price;
    if (raw == null || raw === '') {
        return 0;
    }

    const parsed = typeof raw === 'number' ? raw : parseFloat(String(raw));
    return Number.isFinite(parsed) ? parsed : 0;
}

export function orderCartBillingLines(
    order: ApiOrder | null | undefined,
): OrderCartBillingLine[] {
    return (order?.order_items ?? [])
        .filter((item) => orderItemWireStatus(item) === 'Still In Cart')
        .map((item) => ({
            id: item.id,
            reference: orderItemCutLabel(item),
            amount: orderItemLockedPriceAmount(item),
        }));
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

function parseArtDimensionField(
    specs: OrderItemSpecRecord,
    key: 'w' | 'h',
): number | null {
    const raw = specs[key];
    if (raw == null || raw === '') {
        return null;
    }
    if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (!trimmed) {
            return null;
        }
        const parsed = Number.parseInt(trimmed, 10);
        return Number.isFinite(parsed) ? parsed : null;
    }
    if (typeof raw === 'number' && Number.isFinite(raw)) {
        return raw;
    }
    return null;
}

export function parseOrderItemDimensions(
    specs: OrderItemSpecRecord,
): { width: number | null; height: number | null } {
    const fromWire = {
        width: parseArtDimensionField(specs, 'w'),
        height: parseArtDimensionField(specs, 'h'),
    };
    if (fromWire.width != null || fromWire.height != null) {
        return fromWire;
    }

    const raw =
        specString(specs, 'dimensions') ||
        (specString(specs, 'type').includes('×') ? specString(specs, 'type') : '');

    const match = raw.match(/(\d+)\s*[x×]\s*(\d+)/i);
    if (match) {
        return { width: Number(match[1]), height: Number(match[2]) };
    }

    const width = typeof specs.width === 'number' ? specs.width : null;
    const height = typeof specs.height === 'number' ? specs.height : null;

    return { width, height };
}

/** Wire value for PATCH `specifications.w` / `specifications.h`. */
export function artDimensionWire(value: number | null): string | null {
    if (value == null) {
        return null;
    }
    return String(value);
}

export function orderItemCutLabel(item: OrderItem): string {
    const menuName = item.order_menu_item?.name?.trim() ?? '';
    const specs = orderItemSpecRecord(item);
    const specType = specString(specs, 'type');

    if (isKeyArtOrderItem(item)) {
        const { width, height } = parseOrderItemDimensions(specs);
        const parts = [menuName];
        if (specType && specType !== menuName) {
            parts.push(specType);
        }
        if (width != null && height != null) {
            parts.push(`${width}×${height}`);
        }
        return parts.filter(Boolean).join(' · ') || menuName || `Item ${item.id}`;
    }

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
    if (item.specifiable != null && typeof item.specifiable === 'object') {
        const direct = specString(
            item.specifiable as OrderItemSpecRecord,
            'isci',
        );
        if (direct) {
            return direct;
        }
    }

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
