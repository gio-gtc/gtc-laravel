import {
    buildGlobalFilterParams,
} from '@/lib/orders/global-dashboard-filters';
import type {
    ApiOrder,
    GlobalDashboardFilters,
    IndexOrder,
    PaginatedToursResponse,
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

    const body = (await response.json()) as { order?: ApiOrder };
    if (!body.order) {
        throw new Error('Order not found.');
    }

    return body.order;
}

export function hasMoreTours(pagination: ToursPaginationMeta): boolean {
    return pagination.current_page < pagination.last_page;
}
