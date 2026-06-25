/**
 * Smoke tests for orderItemBillingReference and API-mirrored cart billing helpers.
 * Run: npx tsx scripts/validate-order-item-billing-reference.ts
 */
import { parseWireMoney } from '../resources/js/helper-functions/format-currency.ts';
import {
    BROADCAST_SPECIFIABLE_TYPE,
    KEY_ART_SPECIFIABLE_TYPE,
    orderCartBillingLines,
    orderCartBillingTotal,
    orderItemBillingReference,
} from '../resources/js/lib/orders/order-item-specifications.ts';
import type { OrderItem, VirtualBillingLine } from '../resources/js/types/orders-api.ts';

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

const sampleVirtualBillingLines: VirtualBillingLine[] = [
    {
        type: 'Encoding',
        description: 'Encoding',
        unit_price: 250,
        total: 250,
    },
    {
        type: 'Encoding',
        description: 'Encoding',
        unit_price: 0,
        total: 0,
    },
    {
        type: 'Encoding',
        description: 'Encoding',
        unit_price: 75,
        total: 75,
    },
];

const cartLines = orderCartBillingLines(sampleVirtualBillingLines);
assert(cartLines.length === 3, 'cart: virtual billing rows only');
assert(cartLines[0]?.amount === 250, 'cart: virtual encoding total wire');
assert(cartLines[1]?.amount === 0, 'cart: zero-dollar virtual encoding row');
assert(cartLines[2]?.amount === 75, 'cart: additional virtual encoding total wire');
assert(
    cartLines.every((line) => line.reference === 'Encoding'),
    'cart: virtual encoding descriptions',
);
assert(
    orderCartBillingTotal(sampleVirtualBillingLines) === 325,
    'cart: total sums virtual_billing_lines totals only',
);

assert(
    orderCartBillingLines(null).length === 0,
    'cart: empty when virtual_billing_lines absent',
);
assert(
    orderCartBillingTotal(null) === 0,
    'cart: zero total when virtual_billing_lines absent',
);

console.log('validate-order-item-billing-reference: ok');
