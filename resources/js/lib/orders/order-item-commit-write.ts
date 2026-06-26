import {
    bulkUpdateOrderItems,
    OrderItemApiError,
    updateOrderItem,
} from '@/lib/orders/order-item-api-client';
import type { OrderItemBulkPatch } from '@/lib/orders/order-item-adapters/types';
import type { ApiOrder, OrderItem, ParentOrderUpdate } from '@/types/orders-api';
import { toast } from 'react-toastify';

export type CommitOrderItemWriteFailure = {
    ok: false;
    message: string;
    errors?: Record<string, string[]>;
};

export type CommitOrderItemBulkWriteResult =
    | { ok: true; message: string }
    | CommitOrderItemWriteFailure;

export type CommitOrderItemSingleWriteResult =
    | {
          ok: true;
          message: string;
          order_item: OrderItem;
          parent_order_update?: ParentOrderUpdate;
      }
    | CommitOrderItemWriteFailure;

function failOrderItemWrite(
    error: unknown,
    fallbackMessage: string,
): CommitOrderItemWriteFailure {
    if (error instanceof OrderItemApiError) {
        const validationMessage = error.errors
            ? Object.values(error.errors).flat()[0]
            : undefined;
        const message = validationMessage ?? error.message;
        toast.error(message);
        return { ok: false, message, errors: error.errors };
    }
    toast.error(fallbackMessage);
    return { ok: false, message: fallbackMessage };
}

export function toSingleItemUpdatePayload(
    orderItemId: number,
    patch: OrderItemBulkPatch,
    order: ApiOrder,
): { due_date: string; specifications: Record<string, unknown> } | null {
    const item = order.order_items?.find(
        (orderItem) => orderItem.id === orderItemId,
    );
    const due_date =
        patch.due_date ??
        (item?.due_date ? item.due_date.split('T')[0] : undefined);
    const specifications = patch.specifications;

    if (!due_date || !specifications) {
        return null;
    }

    return { due_date, specifications };
}

export async function commitOrderItemBulkWrite(deps: {
    orderItemIds: number[];
    patch: OrderItemBulkPatch;
    successMessage?: string;
}): Promise<CommitOrderItemBulkWriteResult> {
    const { orderItemIds, patch, successMessage } = deps;

    if (orderItemIds.length === 0) {
        return { ok: false, message: 'No line items selected to update.' };
    }

    try {
        const result = await bulkUpdateOrderItems({
            order_item_ids: orderItemIds,
            ...patch,
        });
        const message =
            successMessage ?? result.message ?? 'Line item(s) updated.';
        toast.success(message);
        return {
            ok: true,
            message,
        };
    } catch (error) {
        return failOrderItemWrite(error, 'Failed to update line item(s).');
    }
}

export async function commitOrderItemSingleWrite(deps: {
    orderItemId: number;
    patch: OrderItemBulkPatch;
    order: ApiOrder;
    successMessage?: string;
}): Promise<CommitOrderItemSingleWriteResult> {
    const { orderItemId, patch, order, successMessage } = deps;

    const payload = toSingleItemUpdatePayload(orderItemId, patch, order);
    if (!payload) {
        const message = 'Could not build update payload for this line item.';
        toast.error(message);
        return { ok: false, message };
    }

    try {
        const result = await updateOrderItem(orderItemId, payload);
        const message =
            successMessage ?? result.message ?? 'Line item updated.';
        toast.success(message);
        return {
            ok: true,
            message,
            order_item: result.order_item,
            parent_order_update: result.parent_order_update,
        };
    } catch (error) {
        return failOrderItemWrite(error, 'Failed to update line item.');
    }
}
