import {
    bulkUpdateOrderItems,
    OrderItemApiError,
} from '@/lib/orders/order-item-api-client';
import type { OrderItemBulkPatch } from '@/lib/orders/order-item-adapters/types';
import type { VirtualBillingLine } from '@/types/orders-api';
import { toast } from 'react-toastify';

export type CommitOrderItemBulkWriteResult =
    | { ok: true; message: string; virtual_billing_lines?: VirtualBillingLine[] }
    | {
          ok: false;
          message: string;
          errors?: Record<string, string[]>;
      };

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
            virtual_billing_lines: result.virtual_billing_lines,
        };
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
