import type { OrderItemStatus as ApiOrderItemStatus } from '@/types/orders-api';

/** gtc-api `order_item_statuses` table — ids and wire labels. */
export const ORDER_ITEM_STATUSES = [
    { id: 1, name: 'Still In Cart' },
    { id: 2, name: 'Unassigned' },
    { id: 3, name: 'In Production' },
    { id: 4, name: 'Client Review' },
    { id: 5, name: 'Revision Request' },
    { id: 6, name: 'Out For Delivery' },
    { id: 7, name: 'Cancelled' },
] as const satisfies ReadonlyArray<{ id: number; name: ApiOrderItemStatus }>;

export type OrderItemStatusName = (typeof ORDER_ITEM_STATUSES)[number]['name'];

/** Physical order_item_status_id values used for write-access gating. */
export const ORDER_ITEM_STATUS_ID = {
    stillInCart: 1,
    unassigned: 2,
    inProduction: 3,
    clientReview: 4,
    revisionRequest: 5,
    outForDelivery: 6,
    cancelled: 7,
} as const;

const LEGACY_LABEL_ALIASES: Record<string, OrderItemStatusName> = {
    'Still in Cart': 'Still In Cart',
    'Out for Delivery': 'Out For Delivery',
    'Revision Requested': 'Revision Request',
    Canceled: 'Cancelled',
};

export function normalizeOrderItemStatusLabel(
    label: string,
): OrderItemStatusName | undefined {
    const trimmed = label.trim();
    if (!trimmed) {
        return undefined;
    }
    const alias = LEGACY_LABEL_ALIASES[trimmed];
    if (alias) {
        return alias;
    }
    const found = ORDER_ITEM_STATUSES.find((s) => s.name === trimmed);
    return found?.name;
}

export function orderItemStatusIdToLabel(
    statusId: number,
): OrderItemStatusName {
    const found = ORDER_ITEM_STATUSES.find((s) => s.id === statusId);
    return found?.name ?? 'Still In Cart';
}

export function orderItemStatusLabelToId(label: string): number | undefined {
    const normalized = normalizeOrderItemStatusLabel(label);
    if (!normalized) {
        return undefined;
    }
    return ORDER_ITEM_STATUSES.find((s) => s.name === normalized)?.id;
}

export function buildOrderItemStatusSelectOptions(): {
    value: string;
    label: string;
}[] {
    return ORDER_ITEM_STATUSES.map((s) => ({ value: s.name, label: s.name }));
}

export function isCancelledStatusId(statusId: number | undefined): boolean {
    return statusId === ORDER_ITEM_STATUS_ID.cancelled;
}

export function isStillInCartStatusId(statusId: number | undefined): boolean {
    return statusId === ORDER_ITEM_STATUS_ID.stillInCart;
}

export function isClientReviewStatusId(statusId: number | undefined): boolean {
    return statusId === ORDER_ITEM_STATUS_ID.clientReview;
}

export function isOutForDeliveryStatusId(statusId: number | undefined): boolean {
    return statusId === ORDER_ITEM_STATUS_ID.outForDelivery;
}

export function isRevisionRequestStatusId(
    statusId: number | undefined,
): boolean {
    return statusId === ORDER_ITEM_STATUS_ID.revisionRequest;
}

/** Normalize API / legacy wire strings to canonical status labels. */
export function orderItemStatusToDisplayLabel(
    status: string,
): OrderItemStatusName {
    return normalizeOrderItemStatusLabel(status) ?? 'Still In Cart';
}
