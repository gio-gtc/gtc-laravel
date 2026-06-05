import { ORDER_HEADER_DESCRIPTION_FIELDS } from '@/lib/orders/order-header-descriptions';
import type {
    ApiOrder,
    OrderHeaderDescriptionKey,
    OrderPatchPayload,
    OrderPatchShowDate,
    OrderShowDate,
    ShowDateEditRow,
} from '@/types/orders-api';

export function normalizeDescription(value: string): string | null {
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
}

export function showDateRowsFromApiOrder(
    showDates: OrderShowDate[] | undefined,
): ShowDateEditRow[] {
    if (!showDates?.length) {
        return [{ show_date: '' }];
    }

    return showDates.map((row) => ({
        id: row.id,
        show_date: row.show_date.split('T')[0],
    }));
}

export function showDateRowsToPatchShowDates(
    rows: ShowDateEditRow[],
): OrderPatchShowDate[] {
    const result: OrderPatchShowDate[] = [];

    for (const row of rows) {
        const showDate = row.show_date.split('T')[0];
        if (!showDate) {
            continue;
        }

        if (row.id != null) {
            result.push({ id: row.id, show_date: showDate });
        } else {
            result.push({ show_date: showDate });
        }
    }

    return result;
}

export function buildOrderPatchPayload(
    descriptions: Record<OrderHeaderDescriptionKey, string>,
    showDateRows: ShowDateEditRow[],
): OrderPatchPayload {
    const payload: OrderPatchPayload = {
        ticket_outlets: null,
        on_same_date: null,
        cardholder_times: null,
        logos: null,
        special_instructions: null,
        show_dates: showDateRowsToPatchShowDates(showDateRows),
    };

    for (const { key } of ORDER_HEADER_DESCRIPTION_FIELDS) {
        payload[key] = normalizeDescription(descriptions[key] ?? '');
    }

    return payload;
}

export function descriptionFormFromApiOrder(
    order: Pick<ApiOrder, OrderHeaderDescriptionKey>,
): Record<OrderHeaderDescriptionKey, string> {
    const form = {} as Record<OrderHeaderDescriptionKey, string>;
    for (const { key } of ORDER_HEADER_DESCRIPTION_FIELDS) {
        form[key] = order[key] ?? '';
    }
    return form;
}
