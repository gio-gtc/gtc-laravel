import { staffEmbedToUser, type PersonEmbed } from '@/lib/user-for-avatar';
import { orderItemStatusToDisplayLabel } from '@/lib/orders/order-item-statuses';
import {
    orderItemCutLabel,
    orderItemDueDateDisplay,
    orderItemDurationSeconds,
    orderItemIsci,
    orderItemSpecRecord,
    orderItemWireStatus,
    parseOrderItemDimensions,
} from '@/lib/orders/order-item-specifications';
import type { MediaTableRow, StaticAssetsTableRow, User } from '@/types';
import type { OrderAssignee, OrderItem } from '@/types/orders-api';

type TableStatus = MediaTableRow['status'];

/** Map API wire status → canonical table badge label. */
export function orderItemStatusToTableStatus(status: string): TableStatus {
    return orderItemStatusToDisplayLabel(status);
}

export function isMediaTableRowStillInCart(
    row: Pick<MediaTableRow, 'status'>,
): boolean {
    return row.status === 'Still In Cart';
}

/** Wire status for a line when the slideout is backed by openOrder. */
export function apiOrderItemTableStatus(
    rowId: string | number,
    openOrder: { order_items?: OrderItem[] } | null,
): TableStatus | undefined {
    const apiItem = openOrder?.order_items?.find(
        (item) => String(item.id) === String(rowId),
    );
    if (!apiItem) {
        return undefined;
    }
    return orderItemStatusToTableStatus(orderItemWireStatus(apiItem));
}

function assigneesToUsers(assignees: OrderAssignee[] | undefined): User[] {
    return (assignees ?? []).map((a) => staffEmbedToUser(a as PersonEmbed));
}

export function orderItemToMediaTableRow(item: OrderItem): MediaTableRow {
    const specs = orderItemSpecRecord(item);
    return {
        id: item.id,
        isci: orderItemIsci(item),
        cutName: orderItemCutLabel(item),
        duration_seconds: orderItemDurationSeconds(specs),
        dueDate: orderItemDueDateDisplay(item),
        assigned: assigneesToUsers(item.assignees),
        status: orderItemStatusToTableStatus(orderItemWireStatus(item)),
        status_id: item.order_item_status_id,
        created_date: item.created_at,
    };
}

export function orderItemToStaticAssetsTableRow(
    item: OrderItem,
): StaticAssetsTableRow {
    const specs = orderItemSpecRecord(item);
    const { width, height } = parseOrderItemDimensions(specs);

    return {
        id: item.id,
        cutName: orderItemCutLabel(item),
        width,
        height,
        dueDate: orderItemDueDateDisplay(item),
        assigned: assigneesToUsers(item.assignees),
        status: orderItemStatusToTableStatus(orderItemWireStatus(item)),
        status_id: item.order_item_status_id,
        created_date: item.created_at,
    };
}
