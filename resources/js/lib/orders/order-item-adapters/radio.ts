import {
    durationWireFromNumericInput,
} from '@/lib/orders/broadcast-spec-wire';
import { ORDER_MENU_CATEGORY_QUADRANTS } from '@/lib/orders/order-menu-categories';
import { dueDateIso } from '@/lib/orders/slideout/legacy-venue-row-to-api-item';
import type { StoreOrderItemPayload } from '@/lib/orders/slideout/legacy-venue-row-to-api-item';
import type { OrderItemsRadioRow } from '@/types';
import type { ApiOrder } from '@/types/orders-api';
import type { OrderItemUpdateAdapter } from './types';

function radioRowDurationWire(row: OrderItemsRadioRow): string | number {
    if (typeof row.duration_seconds === 'string') {
        return row.duration_seconds.trim();
    }
    return row.duration_seconds;
}

function radioUpdateSpecifications(
    row: OrderItemsRadioRow,
): Record<string, unknown> {
    return {
        type: row.spot_type,
        cut: row.cut,
        duration_seconds: radioRowDurationWire(row),
    };
}

export function radioRowToUpdatePayload(
    row: OrderItemsRadioRow,
    order: ApiOrder,
): Pick<StoreOrderItemPayload, 'due_date' | 'specifications'> {
    return {
        due_date: dueDateIso(order, row),
        specifications: radioUpdateSpecifications(row),
    };
}

export const radioUpdateAdapter: OrderItemUpdateAdapter<OrderItemsRadioRow> = {
    categoryId: ORDER_MENU_CATEGORY_QUADRANTS.radio,
    rowToFullBulkPatch: (row, order) => ({
        due_date: dueDateIso(order, row),
        specifications: radioUpdateSpecifications(row),
    }),
    durationPatch: (wire) => ({
        specifications: {
            duration_seconds:
                typeof wire === 'string'
                    ? wire.trim()
                    : durationWireFromNumericInput(wire),
        },
    }),
    statusPatch: (statusId) => ({
        order_item_status_id: statusId,
    }),
    typePatch: (type) => ({
        specifications: { type: type.trim() },
    }),
    cutPatch: (cut) => ({
        specifications: { cut: cut.trim() },
    }),
};
