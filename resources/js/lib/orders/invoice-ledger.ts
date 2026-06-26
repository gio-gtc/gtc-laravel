import { parseWireMoney } from '@/helper-functions/format-currency';
import {
    orderItemBillingReference,
    orderItemWireStatus,
} from '@/lib/orders/order-item-specifications';
import type {
    ApiOrder,
    OrderItem,
    OrderItemStatus,
    SubmitInvoice,
    SubmitInvoiceLine,
} from '@/types/orders-api';

/** Prefer invoice-line embed; fall back to matching order_items row during create/refresh races. */
export function resolveInvoiceLineItemStatus(
    line: SubmitInvoiceLine,
    order: ApiOrder | null | undefined,
): OrderItemStatus | undefined {
    const fromEmbed = line.order_item?.status_lookup?.name;
    if (fromEmbed) {
        return fromEmbed;
    }

    const item = order?.order_items?.find(
        (orderItem) => orderItem.id === line.order_item_id,
    );
    if (item) {
        return orderItemWireStatus(item);
    }

    return undefined;
}

export function invoiceLineItemStatus(
    line: SubmitInvoiceLine,
    order?: ApiOrder | null,
): OrderItemStatus | undefined {
    return resolveInvoiceLineItemStatus(line, order);
}

export function isStillInCartLine(
    line: SubmitInvoiceLine,
    order?: ApiOrder | null,
): boolean {
    return resolveInvoiceLineItemStatus(line, order) === 'Still In Cart';
}

export function heldInvoice(
    order: ApiOrder | null | undefined,
): SubmitInvoice | undefined {
    return order?.invoices?.find((invoice) => invoice.status === 'Held');
}

function invoicedOrderItemIds(order: ApiOrder): Set<number> {
    const ids = new Set<number>();
    for (const invoice of order.invoices ?? []) {
        for (const line of invoice.lines) {
            ids.add(line.order_item_id);
        }
    }
    return ids;
}

function cartLineTotalFromOrderItem(item: OrderItem): string {
    if (item.locked_price) {
        return item.locked_price;
    }
    if (item.estimated_total != null) {
        return item.estimated_total.toFixed(2);
    }
    return '0.00';
}

/** Synthetic ledger row for cart items not yet present on invoices (post-create, pre-refresh). */
function syntheticCartLineFromOrderItem(
    item: OrderItem,
    order: ApiOrder,
): SubmitInvoiceLine {
    const invoiceId = order.invoices?.[0]?.id ?? 0;
    const total = cartLineTotalFromOrderItem(item);

    return {
        id: -item.id,
        invoice_id: invoiceId,
        order_item_id: item.id,
        description: orderItemBillingReference(item),
        unit_price: total,
        quantity: 1,
        total,
        created_at: item.created_at,
        updated_at: item.updated_at,
        order_item: {
            status_lookup: { name: orderItemWireStatus(item) },
        },
    };
}

export function cartInvoiceLines(
    order: ApiOrder | null | undefined,
): SubmitInvoiceLine[] {
    if (!order) {
        return [];
    }

    const invoices = order.invoices ?? [];
    const fromInvoices = invoices.flatMap((invoice) =>
        invoice.lines.filter((line) => isStillInCartLine(line, order)),
    );

    const invoicedIds = invoicedOrderItemIds(order);
    const orphanCartItems = (order.order_items ?? []).filter(
        (item) =>
            orderItemWireStatus(item) === 'Still In Cart' &&
            !invoicedIds.has(item.id),
    );

    const synthetic = orphanCartItems.map((item) =>
        syntheticCartLineFromOrderItem(item, order),
    );

    return [...fromInvoices, ...synthetic];
}

export function billingInvoicesForDisplay(
    order: ApiOrder | null | undefined,
): SubmitInvoice[] {
    const invoices = order?.invoices ?? [];
    const result = invoices
        .map((invoice) => ({
            ...invoice,
            lines: invoice.lines.filter(
                (line) => !isStillInCartLine(line, order),
            ),
        }))
        .filter((invoice) => invoice.lines.length > 0);

    return result;
}

export function sumInvoiceLineTotals(lines: SubmitInvoiceLine[]): number {
    return lines.reduce((sum, line) => sum + parseWireMoney(line.total), 0);
}

export function upsertInvoicesById(
    existing: SubmitInvoice[],
    incoming: SubmitInvoice[],
): SubmitInvoice[] {
    const map = new Map(existing.map((invoice) => [invoice.id, invoice]));
    for (const invoice of incoming) {
        map.set(invoice.id, invoice);
    }
    return [...map.values()];
}
