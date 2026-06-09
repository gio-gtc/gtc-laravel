import { getCsrfHeaders } from '@/lib/forms/csrf';
import type { OrderCatalogMenu } from '@/types/order-catalog';
import type { OrderItem } from '@/types/orders-api';
import type { StoreOrderItemPayload } from '@/lib/orders/slideout/legacy-venue-row-to-api-item';

export type OrderItemMutationResponse = {
    message: string;
    order_item: OrderItem;
};

export type OrderItemValidationError = {
    message: string;
    errors?: Record<string, string[]>;
};

export class OrderItemApiError extends Error {
    status: number;
    errors?: Record<string, string[]>;

    constructor(
        message: string,
        status: number,
        errors?: Record<string, string[]>,
    ) {
        super(message);
        this.name = 'OrderItemApiError';
        this.status = status;
        this.errors = errors;
    }
}

async function parseMutationResponse(
    response: Response,
): Promise<OrderItemMutationResponse> {
    const body = (await response.json()) as OrderItemMutationResponse &
        OrderItemValidationError;

    if (!response.ok) {
        throw new OrderItemApiError(
            body.message ?? 'Could not complete order item request.',
            response.status,
            body.errors,
        );
    }

    if (!body.order_item) {
        throw new OrderItemApiError(
            'Invalid order item response from server.',
            502,
        );
    }

    return body;
}

export async function fetchOrderCatalogMenu(
    signal?: AbortSignal,
): Promise<OrderCatalogMenu> {
    const response = await fetch('/api/order-catalog-menu', {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
        signal,
    });

    if (!response.ok) {
        throw new Error('Could not load order catalog menu.');
    }

    const body = (await response.json()) as {
        data?: OrderCatalogMenu | { catalog?: OrderCatalogMenu };
        catalog?: OrderCatalogMenu;
    };

    const raw = body.data ?? body.catalog;
    if (Array.isArray(raw)) {
        return raw;
    }
    if (raw && typeof raw === 'object' && Array.isArray(raw.catalog)) {
        return raw.catalog;
    }

    return [];
}

export async function createOrderItem(
    orderId: number,
    payload: StoreOrderItemPayload,
    signal?: AbortSignal,
): Promise<OrderItem> {
    const headers = getCsrfHeaders();

    const response = await fetch(`/api/orders/${orderId}/items`, {
        method: 'POST',
        headers,
        credentials: 'same-origin',
        signal,
        body: JSON.stringify(payload),
    });

    const parsed = await parseMutationResponse(response);
    return parsed.order_item;
}

/** PATCH /api/order-items/{itemId} — update cart line specifications. */
export async function updateOrderItem(
    orderItemId: number,
    payload: Pick<StoreOrderItemPayload, 'due_date' | 'specifications'>,
    signal?: AbortSignal,
): Promise<OrderItem> {
    const headers = getCsrfHeaders();

    const response = await fetch(`/api/order-items/${orderItemId}`, {
        method: 'PATCH',
        headers,
        credentials: 'same-origin',
        signal,
        body: JSON.stringify(payload),
    });

    const parsed = await parseMutationResponse(response);
    return parsed.order_item;
}

/** Follow-up PR: remove from cart. */
export async function deleteOrderItem(
    orderItemId: number,
    signal?: AbortSignal,
): Promise<OrderItem> {
    const headers = getCsrfHeaders();

    const response = await fetch(`/api/order-items/${orderItemId}`, {
        method: 'DELETE',
        headers,
        credentials: 'same-origin',
        signal,
    });

    const parsed = await parseMutationResponse(response);
    return parsed.order_item;
}
