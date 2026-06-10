import { getCsrfHeaders } from '@/lib/forms/csrf';
import { staffEmbedToUser } from '@/lib/user-for-avatar';
import type { User } from '@/types';
import type { OrderCatalogMenu } from '@/types/order-catalog';
import type { OrderItem, StaffWireUser } from '@/types/orders-api';
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

type AssigneeMutationResponse = {
    message: string;
    assignees: StaffWireUser[];
};

type StaffIndexResponse = {
    staff: StaffWireUser[];
};

function mapStaffWireUsers(rows: StaffWireUser[] | undefined): User[] {
    return (rows ?? []).map((row) => staffEmbedToUser(row));
}

async function parseAssigneeMutationResponse(
    response: Response,
): Promise<AssigneeMutationResponse> {
    const body = (await response.json()) as AssigneeMutationResponse &
        OrderItemValidationError;

    if (!response.ok) {
        throw new OrderItemApiError(
            body.message ?? 'Could not complete assignee request.',
            response.status,
            body.errors,
        );
    }

    return body;
}

/** GET /api/staff — internal GTC staff roster (organisation_id = 1). */
export async function fetchStaffRoster(
    signal?: AbortSignal,
): Promise<User[]> {
    const response = await fetch('/api/staff', {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
        signal,
    });

    if (!response.ok) {
        const body = (await response.json()) as OrderItemValidationError;
        throw new OrderItemApiError(
            body.message ?? 'Could not load staff roster.',
            response.status,
            body.errors,
        );
    }

    const body = (await response.json()) as StaffIndexResponse;

    return mapStaffWireUsers(body.staff);
}

/** POST /api/order-items/{itemId}/assignees — sync assignees for a line item. */
export async function syncOrderItemAssignees(
    orderItemId: number,
    userIds: number[],
    signal?: AbortSignal,
): Promise<User[]> {
    const headers = getCsrfHeaders();

    const response = await fetch(`/api/order-items/${orderItemId}/assignees`, {
        method: 'POST',
        headers,
        credentials: 'same-origin',
        signal,
        body: JSON.stringify({ user_ids: userIds }),
    });

    const parsed = await parseAssigneeMutationResponse(response);

    return mapStaffWireUsers(parsed.assignees);
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

/** DELETE /api/order-items/{itemId} — soft-cancel cart line. */
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
