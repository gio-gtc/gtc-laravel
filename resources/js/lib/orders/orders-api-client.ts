import { getCsrfHeaders } from '@/lib/forms/csrf';
import {
    buildGlobalFilterParams,
} from '@/lib/orders/global-dashboard-filters';
import type {
    ApiOrder,
    GlobalDashboardFilters,
    IndexOrder,
    OrderPatchPayload,
    OrderShowResponse,
    PaginatedToursResponse,
    SubmitOrderResponse,
    ClearOrderCartResponse,
    ToursPaginationMeta,
} from '@/types/orders-api';

function unwrapToursPayload(body: unknown): PaginatedToursResponse {
    const root = body as Record<string, unknown>;
    const envelope =
        root.data !== undefined && !Array.isArray(root.data)
            ? (root.data as Record<string, unknown>)
            : root;

    const data = Array.isArray(envelope.data)
        ? envelope.data
        : Array.isArray(root.data)
          ? root.data
          : [];

    return {
        current_page: Number(envelope.current_page ?? 1),
        last_page: Number(envelope.last_page ?? 1),
        total: Number(envelope.total ?? data.length),
        next_page_url:
            typeof envelope.next_page_url === 'string'
                ? envelope.next_page_url
                : null,
        data: data as PaginatedToursResponse['data'],
    };
}

export async function fetchToursPage(
    page: number,
    filters: GlobalDashboardFilters,
    signal?: AbortSignal,
): Promise<PaginatedToursResponse> {
    const params = buildGlobalFilterParams(filters);
    params.set('page', String(page));

    const response = await fetch(`/api/tours?${params}`, {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
        signal,
    });

    if (!response.ok) {
        throw new Error('Could not load tours.');
    }

    return unwrapToursPayload(await response.json());
}

export async function fetchTourOrders(
    tourId: number,
    filters: GlobalDashboardFilters,
    signal?: AbortSignal,
): Promise<IndexOrder[]> {
    const params = buildGlobalFilterParams(filters);
    const query = params.toString();
    const url = query
        ? `/api/tours/${tourId}/orders?${query}`
        : `/api/tours/${tourId}/orders`;

    const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
        signal,
    });

    if (!response.ok) {
        throw new Error('Could not load orders for this tour.');
    }

    const body = (await response.json()) as { data?: IndexOrder[] };
    return body.data ?? [];
}

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

export function hasMoreTours(pagination: ToursPaginationMeta): boolean {
    return pagination.current_page < pagination.last_page;
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
