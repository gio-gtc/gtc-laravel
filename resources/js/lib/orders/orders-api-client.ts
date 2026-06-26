import { getCsrfHeaders } from '@/lib/forms/csrf';
import type {
    ApiOrder,
    OrderPatchPayload,
    OrderShowResponse,
    SubmitOrderResponse,
    ClearOrderCartResponse,
} from '@/types/orders-api';

export async function fetchOrderShow(
    orderId: number,
    signal?: AbortSignal,
): Promise<ApiOrder> {
    const response = await fetch(`/api/orders/${orderId}`, {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
        signal,
    });

    if (!response.ok) {
        throw new Error('Could not load order details.');
    }

    const body = (await response.json()) as OrderShowResponse;
    if (!body.order) {
        throw new Error('Order not found.');
    }

    return body.order;
}

export async function patchOrder(
    orderId: number,
    payload: OrderPatchPayload,
    signal?: AbortSignal,
): Promise<ApiOrder | null> {
    const headers = getCsrfHeaders();

    const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers,
        credentials: 'same-origin',
        signal,
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error('Could not save order info.');
    }

    const body = (await response.json()) as { order?: ApiOrder; ok?: boolean };

    return body.order ?? null;
}

export class OrderSubmitApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'OrderSubmitApiError';
        this.status = status;
    }
}

export async function submitOrder(
    orderId: number,
    signal?: AbortSignal,
): Promise<SubmitOrderResponse> {
    const headers = getCsrfHeaders();

    const response = await fetch(`/api/orders/${orderId}/submit`, {
        method: 'POST',
        headers,
        credentials: 'same-origin',
        signal,
    });

    const body = (await response.json()) as SubmitOrderResponse & {
        message?: string;
    };

    if (!response.ok) {
        throw new OrderSubmitApiError(
            body.message ?? 'Could not submit order.',
            response.status,
        );
    }

    if (!body.order || !body.invoice) {
        throw new OrderSubmitApiError(
            'Invalid submit response from server.',
            502,
        );
    }

    return body;
}

export class OrderCartClearApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'OrderCartClearApiError';
        this.status = status;
    }
}

export async function clearOrderCart(
    orderId: number,
    signal?: AbortSignal,
): Promise<ClearOrderCartResponse> {
    const headers = getCsrfHeaders();

    const response = await fetch(`/api/orders/${orderId}/cart`, {
        method: 'DELETE',
        headers,
        credentials: 'same-origin',
        signal,
    });

    const body = (await response.json()) as ClearOrderCartResponse & {
        message?: string;
    };

    if (!response.ok) {
        throw new OrderCartClearApiError(
            body.message ?? 'Could not clear cart.',
            response.status,
        );
    }

    if (
        typeof body.message !== 'string' ||
        typeof body.order_deleted !== 'boolean' ||
        typeof body.count !== 'number'
    ) {
        throw new OrderCartClearApiError(
            'Invalid clear cart response from server.',
            502,
        );
    }

    return body;
}
