import { isMediaTableRowStillInCart } from '@/lib/orders/order-item-table-rows';
import type { MediaTableRow } from '@/types';

const ORDER_LINE_ITEM_ADMIN_ROLES = ['Super Admin', 'Admin'] as const;

/** Admin and Super Admin may edit line items regardless of pipeline status. */
export function isOrderLineItemAdmin(roles: readonly string[]): boolean {
    return roles.some((role) =>
        (ORDER_LINE_ITEM_ADMIN_ROLES as readonly string[]).includes(role),
    );
}

export function isOrderLineItemEditDisabled(
    row: Pick<MediaTableRow, 'status' | 'status_id'>,
    roles: readonly string[],
    apiSlideoutOrderId?: number,
): boolean {
    if (isOrderLineItemAdmin(roles)) {
        return false;
    }

    if (apiSlideoutOrderId != null) {
        return !isMediaTableRowStillInCart(row);
    }

    return row.status_id !== 1;
}

export function canEditOrderItemAssignees(
    roles: readonly string[],
    row: Pick<MediaTableRow, 'status'>,
): boolean {
    return (
        isOrderLineItemAdmin(roles) &&
        row.status !== 'Cancelled' &&
        row.status !== 'Revision Requested'
    );
}
