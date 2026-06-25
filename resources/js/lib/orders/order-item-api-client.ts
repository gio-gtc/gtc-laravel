import { getCsrfHeaders } from '@/lib/forms/csrf';
import { staffEmbedToUser } from '@/lib/user-for-avatar';
import type { User } from '@/types';
import type { OrderCatalogMenu } from '@/types/order-catalog';
import type {
    OrderItem,
    ParentOrderUpdate,
    StaffWireUser,
    VirtualBillingLine,
} from '@/types/orders-api';
import type { StoreOrderItemPayload } from '@/lib/orders/slideout/legacy-venue-row-to-api-item';

export type OrderItemMutationResponse = {
    message: string;
    order_item: OrderItem;
    parent_order_update?: ParentOrderUpdate;
    virtual_billing_lines?: VirtualBillingLine[];
};

export type AssigneeMutationResponse = {
    message: string;
    assignees: StaffWireUser[];
    parent_order_update?: ParentOrderUpdate;
};

export type AssigneeSyncResult = {
    users: User[];
    parent_order_update?: ParentOrderUpdate;
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
): Promise<AssigneeSyncResult> {
    const headers = getCsrfHeaders();

    const response = await fetch(`/api/order-items/${orderItemId}/assignees`, {
        method: 'POST',
        headers,
        credentials: 'same-origin',
        signal,
        body: JSON.stringify({ user_ids: userIds }),
    });

    const parsed = await parseAssigneeMutationResponse(response);

    return {
        users: mapStaffWireUsers(parsed.assignees),
        parent_order_update: parsed.parent_order_update,
    };
}

/** DELETE /api/order-items/{itemId}/assignees/{userId} — remove one assignee. */
export async function removeOrderItemAssignee(
    orderItemId: number,
    userId: number,
    signal?: AbortSignal,
): Promise<AssigneeSyncResult> {
    const headers = getCsrfHeaders();

    const response = await fetch(
        `/api/order-items/${orderItemId}/assignees/${userId}`,
        {
            method: 'DELETE',
            headers,
            credentials: 'same-origin',
            signal,
        },
    );

    const parsed = await parseAssigneeMutationResponse(response);

    return {
        users: mapStaffWireUsers(parsed.assignees),
        parent_order_update: parsed.parent_order_update,
    };
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
): Promise<OrderItemMutationResponse> {
    const headers = getCsrfHeaders();

    const response = await fetch(`/api/orders/${orderId}/items`, {
        method: 'POST',
        headers,
        credentials: 'same-origin',
        signal,
        body: JSON.stringify(payload),
    });

    return parseMutationResponse(response);
}

/** PATCH /api/order-items/{itemId} — update cart line specifications. */
export async function updateOrderItem(
    orderItemId: number,
    payload: Pick<StoreOrderItemPayload, 'due_date' | 'specifications'>,
    signal?: AbortSignal,
): Promise<OrderItemMutationResponse> {
    const headers = getCsrfHeaders();

    const response = await fetch(`/api/order-items/${orderItemId}`, {
        method: 'PATCH',
        headers,
        credentials: 'same-origin',
        signal,
        body: JSON.stringify(payload),
    });

    return parseMutationResponse(response);
}

/** DELETE /api/order-items/{itemId} — hard-delete cart line (Still In Cart only). */
export async function deleteOrderItem(
    orderItemId: number,
    signal?: AbortSignal,
): Promise<{ message: string; order_item?: OrderItem }> {
    const headers = getCsrfHeaders();

    const response = await fetch(`/api/order-items/${orderItemId}`, {
        method: 'DELETE',
        headers,
        credentials: 'same-origin',
        signal,
    });

    const body = (await response.json()) as OrderItemMutationResponse &
        OrderItemValidationError;

    if (!response.ok) {
        throw new OrderItemApiError(
            body.message ?? 'Could not remove order item.',
            response.status,
            body.errors,
        );
    }

    return {
        message: body.message ?? 'Line item removed.',
        order_item: body.order_item,
    };
}

export type OrderItemBulkUpdatePayload = {
    order_item_ids: number[];
    due_date?: string;
    order_item_status_id?: number;
    assignee_ids?: number[];
    specifications?: Record<string, unknown>;
};

export type OrderItemBulkUpdateResponse = {
    message: string;
    meta: {
        updated_items_count: number;
        affected_orders: number[];
    };
    virtual_billing_lines?: VirtualBillingLine[];
};

async function parseBulkUpdateResponse(
    response: Response,
): Promise<OrderItemBulkUpdateResponse> {
    const body = (await response.json()) as OrderItemBulkUpdateResponse &
        OrderItemValidationError;

    if (!response.ok) {
        throw new OrderItemApiError(
            body.message ?? 'Could not complete bulk order item update.',
            response.status,
            body.errors,
        );
    }

    if (!body.meta) {
        throw new OrderItemApiError(
            'Invalid bulk update response from server.',
            502,
        );
    }

    return body;
}

/** POST /api/order-items/bulk-update — batch or single dirty-field updates. */
export async function bulkUpdateOrderItems(
    payload: OrderItemBulkUpdatePayload,
    signal?: AbortSignal,
): Promise<OrderItemBulkUpdateResponse> {
    const headers = getCsrfHeaders();

    const response = await fetch('/api/order-items/bulk-update', {
        method: 'POST',
        headers,
        credentials: 'same-origin',
        signal,
        body: JSON.stringify(payload),
    });

    return parseBulkUpdateResponse(response);
}

/** POST /api/order-items/{itemId}/revise — client revision request. */
export async function reviseOrderItem(
    orderItemId: number,
    comment: string,
    signal?: AbortSignal,
): Promise<OrderItemMutationResponse> {
    const headers = getCsrfHeaders();

    const response = await fetch(`/api/order-items/${orderItemId}/revise`, {
        method: 'POST',
        headers,
        credentials: 'same-origin',
        signal,
        body: JSON.stringify({ comment }),
    });

    return parseMutationResponse(response);
}
