import { staffEmbedToUser, type PersonEmbed } from '@/lib/user-for-avatar';
import {
    orderItemCutLabel,
    orderItemDueDateDisplay,
    orderItemDurationSeconds,
    orderItemIsci,
    parseOrderItemDimensions,
} from '@/lib/orders/order-item-specifications';
import type { MediaTableRow, StaticAssetsTableRow, User } from '@/types';
import type {
    OrderAssignee,
    OrderItem,
    OrderItemStatus,
} from '@/types/orders-api';

type TableStatus = MediaTableRow['status'];

/** Map API Title Case item status → legacy table badge labels. */
export function orderItemStatusToTableStatus(
    status: OrderItemStatus,
): TableStatus {
    const map: Record<OrderItemStatus, TableStatus> = {
        'Still In Cart': 'Still in Cart',
        Unassigned: 'Unassigned',
        'In Production': 'In Production',
        'Client Review': 'Client Review',
        'Out For Delivery': 'Out for Delivery',
        Canceled: 'Cancelled',
    };

    return map[status];
}

function assigneesToUsers(assignees: OrderAssignee[] | undefined): User[] {
    return (assignees ?? []).map((a) => staffEmbedToUser(a as PersonEmbed));
}

export function orderItemToMediaTableRow(item: OrderItem): MediaTableRow {
    return {
        id: item.id,
        isci: orderItemIsci(item),
        cutName: orderItemCutLabel(item),
        duration_seconds: orderItemDurationSeconds(item.specifications),
        dueDate: orderItemDueDateDisplay(item),
        assigned: assigneesToUsers(item.assignees),
        status: orderItemStatusToTableStatus(item.status),
        created_date: item.created_at,
    };
}

export function orderItemToStaticAssetsTableRow(
    item: OrderItem,
): StaticAssetsTableRow {
    const { width, height } = parseOrderItemDimensions(item.specifications);

    return {
        id: item.id,
        cutName: orderItemCutLabel(item),
        width,
        height,
        dueDate: orderItemDueDateDisplay(item),
        assigned: assigneesToUsers(item.assignees),
        status: orderItemStatusToTableStatus(item.status),
        created_date: item.created_at,
    };
}
