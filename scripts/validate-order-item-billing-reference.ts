/**
 * Smoke tests for orderItemBillingReference. Run: npx tsx scripts/validate-order-item-billing-reference.ts
 */
import {
    BROADCAST_SPECIFIABLE_TYPE,
    KEY_ART_SPECIFIABLE_TYPE,
    orderItemBillingReference,
} from '../resources/js/lib/orders/order-item-specifications.ts';
import type { OrderItem } from '../resources/js/types/orders-api.ts';

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

console.log('validate-order-item-billing-reference: ok');
