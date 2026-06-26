/**
 * Smoke tests for orderItemBillingReference and invoice-ledger cart billing helpers.
 * Run: npx tsx scripts/validate-order-item-billing-reference.ts
 */
import { parseWireMoney } from '../resources/js/helper-functions/format-currency.ts';
import {
    billingInvoicesForDisplay,
    cartInvoiceLines,
    sumInvoiceLineTotals,
} from '../resources/js/lib/orders/invoice-ledger.ts';
import {
    BROADCAST_SPECIFIABLE_TYPE,
    KEY_ART_SPECIFIABLE_TYPE,
    orderCartBillingLines,
    orderCartBillingTotal,
    orderItemBillingReference,
} from '../resources/js/lib/orders/order-item-specifications.ts';
import type {
    ApiOrder,
    OrderItem,
    SubmitInvoice,
    SubmitInvoiceLine,
} from '../resources/js/types/orders-api.ts';

function assert(condition: boolean, message: string): void {
    if (!condition) {
        throw new Error(message);
    }
}

function baseItem(overrides: Partial<OrderItem> = {}): OrderItem {
    return {
        id: 1,
        order_id: 1,
        order_menu_item_id: 1,
        order_item_status_id: 1,
        due_date: '2026-10-15',
        created_at: '2026-05-27T20:00:00.000000Z',
        updated_at: '2026-05-27T20:00:00.000000Z',
        order_menu_item: {
            id: 1,
            name: 'Broadcast & Streaming Video Details',
            order_menu_category_id: 1,
        },
        ...overrides,
    };
}

function invoiceLine(
    overrides: Partial<SubmitInvoiceLine> & Pick<SubmitInvoiceLine, 'id'>,
    status: SubmitInvoiceLine['order_item']['status_lookup']['name'],
): SubmitInvoiceLine {
    return {
        invoice_id: 12,
        order_item_id: overrides.id,
        description: 'Generic On Sale Now :30',
        unit_price: '575.00',
        quantity: 1,
        total: '575.00',
        created_at: '2026-06-24T12:00:00.000000Z',
        updated_at: '2026-06-24T12:00:00.000000Z',
        order_item: { status_lookup: { name: status } },
        ...overrides,
    };
}

function sampleOrderWithInvoices(invoices: SubmitInvoice[]): ApiOrder {
    return {
        id: 1,
        uuid: 'test-uuid',
        tour_id: 1,
        venue_id: 1,
        ordered_by_id: 1,
        is_demo: false,
        local_deliverable_email: null,
        submitted_at: null,
        due_date: '2026-10-15',
        created_at: '2026-05-27T20:00:00.000000Z',
        updated_at: '2026-05-27T20:00:00.000000Z',
        status: 'New Order',
        item_statuses: ['Still In Cart'],
        invoices,
    };
}

const broadcastItem = baseItem({
    specifiable_type: BROADCAST_SPECIFIABLE_TYPE,
    specifiable: {
        id: 1,
        type: 'Generic',
        cut: 'On Sale Now',
        duration_seconds: '30',
        language: 'English',
        encoding: ['Station MP4 (Broadcast)'],
        isci: 'ISCI-TEST',
    },
});

assert(
    orderItemBillingReference(broadcastItem) === 'Generic On Sale Now :30',
    'broadcast: type cut duration',
);

const missingCutItem = baseItem({
    specifiable_type: BROADCAST_SPECIFIABLE_TYPE,
    specifiable: {
        id: 2,
        type: 'Generic',
        cut: '',
        duration_seconds: '30',
        language: 'English',
        encoding: [],
        isci: 'ISCI-TEST2',
    },
});

assert(
    orderItemBillingReference(missingCutItem) === 'Generic :30',
    'broadcast: missing cut',
);

const keyArtItem = baseItem({
    id: 99,
    order_menu_item_id: 4,
    order_menu_item: {
        id: 4,
        name: 'Key Art Package',
        order_menu_category_id: 4,
    },
    specifiable_type: KEY_ART_SPECIFIABLE_TYPE,
    specifiable: {
        type: 'Key Art Package',
        w: '1920',
        h: '1080',
    },
});

assert(
    orderItemBillingReference(keyArtItem) === 'Key Art Package 1920×1080',
    'key art: type and dimensions',
);

const emptyKeyArtItem = baseItem({
    id: 100,
    order_menu_item_id: 4,
    order_menu_item: {
        id: 4,
        name: 'Key Art Package',
        order_menu_category_id: 4,
    },
    specifiable_type: KEY_ART_SPECIFIABLE_TYPE,
    specifiable: {
        type: '',
        w: null,
        h: null,
    },
});

assert(
    orderItemBillingReference(emptyKeyArtItem) === 'Item 100',
    'key art: empty specs fallback',
);

assert(parseWireMoney('1200.00') === 1200, 'parseWireMoney: decimal string');
assert(parseWireMoney(null) === 0, 'parseWireMoney: null');
assert(parseWireMoney('250.00') === 250, 'parseWireMoney: no cents division');

const heldInvoice: SubmitInvoice = {
    id: 12,
    order_id: 1,
    organisation_id: 4,
    document_number: '975950',
    status: 'Held',
    subtotal: '900.00',
    tax: '0.00',
    total: '900.00',
    payment_due: null,
    lines: [
        invoiceLine({ id: 1, description: 'Cart line', total: '575.00' }, 'Still In Cart'),
        invoiceLine({ id: 2, description: 'Encoding', total: '250.00' }, 'Still In Cart'),
        invoiceLine({ id: 3, description: 'Production line', total: '325.00' }, 'Unassigned'),
    ],
};

const order = sampleOrderWithInvoices([heldInvoice]);

const cartLines = cartInvoiceLines(order);
assert(cartLines.length === 2, 'cart: only Still In Cart lines');
assert(cartLines.every((l) => l.order_item.status_lookup.name === 'Still In Cart'), 'cart: status filter');

const mappedCart = orderCartBillingLines(cartLines);
assert(mappedCart.length === 2, 'cart: mapped row count');
assert(mappedCart[0]?.amount === 575, 'cart: first line total wire');
assert(mappedCart[1]?.amount === 250, 'cart: encoding line total wire');
assert(orderCartBillingTotal(cartLines) === 825, 'cart: total sums line.total only');

const billing = billingInvoicesForDisplay(order);
assert(billing.length === 1, 'billing: held non-cart group only');
assert(billing[0]?.lines.length === 1, 'billing: one production line on held');
assert(billing[0]?.lines[0]?.description === 'Production line', 'billing: production line reference');

const orderWithPaid: ApiOrder = sampleOrderWithInvoices([
    heldInvoice,
    {
        id: 20,
        order_id: 1,
        organisation_id: 4,
        document_number: '975951',
        status: 'Paid',
        subtotal: '100.00',
        tax: '0.00',
        total: '100.00',
        payment_due: null,
        lines: [
            invoiceLine({ id: 10, description: 'Paid line', total: '100.00' }, 'Out For Delivery'),
        ],
    },
]);

const billingWithPaid = billingInvoicesForDisplay(orderWithPaid);
assert(billingWithPaid.length === 2, 'billing: held non-cart + paid invoice');

const unpaidWithCart: SubmitInvoice = {
    id: 5,
    order_id: 10,
    organisation_id: 4,
    document_number: '975952',
    status: 'Unpaid',
    subtotal: '500.00',
    tax: '0.00',
    total: '500.00',
    payment_due: '2026-07-01',
    lines: [
        invoiceLine({ id: 4, description: 'Amex On Sale Now :15', total: '200.00' }, 'Still In Cart'),
        invoiceLine({ id: 5, description: 'Social - 16:9 Pre Sale :15', total: '150.00' }, 'Still In Cart'),
        invoiceLine({ id: 6, description: 'TikTok Pre Sale :15', total: '150.00' }, 'Unassigned'),
    ],
};

const orderUnpaidCart = sampleOrderWithInvoices([unpaidWithCart]);
assert(cartInvoiceLines(orderUnpaidCart).length === 2, 'cart: Still In Cart on Unpaid invoice');
const billingUnpaid = billingInvoicesForDisplay(orderUnpaidCart);
assert(billingUnpaid.length === 1, 'billing: unpaid group without cart lines');
assert(billingUnpaid[0]?.lines.length === 1, 'billing: one non-cart line on unpaid');
assert(
    billingUnpaid[0]?.lines.every((l) => l.order_item.status_lookup.name !== 'Still In Cart'),
    'billing: excludes Still In Cart from unpaid',
);

const orderOrphanOnly = sampleOrderWithInvoices([]);
orderOrphanOnly.order_items = [
    {
        id: 99,
        order_id: 10,
        order_menu_item_id: 1,
        order_item_status_id: 1,
        due_date: '2026-10-15',
        created_at: '2026-06-24T12:00:00.000000Z',
        updated_at: '2026-06-24T12:00:00.000000Z',
        locked_price: '99.00',
        status_lookup: { id: 1, name: 'Still In Cart', order_status_id: 1 },
        order_menu_item: { id: 1, name: 'Broadcast', order_menu_category_id: 1 },
    },
];
assert(cartInvoiceLines(orderOrphanOnly).length === 1, 'cart: orphan Still In Cart item before invoice line exists');
assert(billingInvoicesForDisplay(orderOrphanOnly).length === 0, 'billing: no rows without invoice lines');

const lineMissingEmbed = invoiceLine(
    { id: 7, description: 'No embed yet', total: '50.00' },
    'Still In Cart',
);
delete (lineMissingEmbed as { order_item?: unknown }).order_item;
const orderMissingEmbed = sampleOrderWithInvoices([
    {
        ...unpaidWithCart,
        lines: [...unpaidWithCart.lines, lineMissingEmbed],
    },
]);
orderMissingEmbed.order_items = [
    ...(orderMissingEmbed.order_items ?? []),
    {
        id: 7,
        order_id: 10,
        order_menu_item_id: 1,
        order_item_status_id: 1,
        due_date: '2026-10-15',
        created_at: '2026-06-24T12:00:00.000000Z',
        updated_at: '2026-06-24T12:00:00.000000Z',
        status_lookup: { id: 1, name: 'Still In Cart', order_status_id: 1 },
        order_menu_item: { id: 1, name: 'Broadcast', order_menu_category_id: 1 },
    },
];
assert(cartInvoiceLines(orderMissingEmbed).some((l) => l.id === 7), 'cart: embed fallback via order_items');
assert(
    !billingInvoicesForDisplay(orderMissingEmbed).flatMap((i) => i.lines).some((l) => l.id === 7),
    'billing: embed fallback excludes cart line',
);

assert(sumInvoiceLineTotals(cartInvoiceLines(null)) === 0, 'cart: zero when no order');

console.log('validate-order-item-billing-reference: ok');
