import {
    bulkUpdateOrderItems,
    OrderItemApiError,
} from '@/lib/orders/order-item-api-client';
import type { OrderItemBulkPatch } from '@/lib/orders/order-item-adapters/types';
import { toast } from 'react-toastify';

export type CommitOrderItemBulkWriteResult =
    | { ok: true; message: string }
    | {
          ok: false;
          message: string;
          errors?: Record<string, string[]>;
      };

export async function commitOrderItemBulkWrite(deps: {
    orderId: number;
    orderItemIds: number[];
    patch: OrderItemBulkPatch;
    refreshOpenOrder: (orderId: number) => Promise<unknown>;
    successMessage?: string;
}): Promise<CommitOrderItemBulkWriteResult> {
    const { orderId, orderItemIds, patch, refreshOpenOrder, successMessage } =
        deps;

    if (orderItemIds.length === 0) {
        return { ok: false, message: 'No line items selected to update.' };
    }

    try {
        const result = await bulkUpdateOrderItems({
            order_item_ids: orderItemIds,
            ...patch,
        });
        await refreshOpenOrder(orderId);
        const message =
            successMessage ?? result.message ?? 'Line item(s) updated.';
        toast.success(message);
        return { ok: true, message };
    } catch (error) {
        if (error instanceof OrderItemApiError) {
            const validationMessage = error.errors
                ? Object.values(error.errors).flat()[0]
                : undefined;
            const message = validationMessage ?? error.message;
            toast.error(message);
            return { ok: false, message, errors: error.errors };
        }
        const message = 'Failed to update line item(s).';
        toast.error(message);
        return { ok: false, message };
    }
}
