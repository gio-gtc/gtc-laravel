import type { ApiOrder, OrderAssignee } from '@/types/orders-api';
import type { User } from '@/types';

/** GTC internal org — collaborators (staff) use this organisation_id. */
export const GTC_INTERNAL_ORG_ID = 1;

export function isCollaboratorUser(user: User): boolean {
    return user.organisation_id === GTC_INTERNAL_ORG_ID;
}

export function isClientUser(user: User): boolean {
    return user.organisation_id !== GTC_INTERNAL_ORG_ID;
}

export function filterClientUsers(users: User[]): User[] {
    return users.filter(isClientUser);
}

export function filterCollaboratorUsers(users: User[]): User[] {
    return users.filter(isCollaboratorUser);
}

export function resolveUserById(
    id: number | null | undefined,
    roster: User[],
): User | undefined {
    if (id == null) return undefined;
    return roster.find((u) => u.id === id);
}

export function assigneeToUser(assignee: OrderAssignee, roster?: User[]): User {
    const fromRoster = resolveUserById(assignee.id, roster ?? []);
    if (fromRoster) {
        return fromRoster;
    }

    return {
        id: assignee.id,
        name: assignee.name,
        email: assignee.email,
        email_verified_at: null,
        role: '',
        organisation_id: GTC_INTERNAL_ORG_ID,
        created_at: '',
        updated_at: '',
    };
}

export function resolveClientForOrder(
    order: ApiOrder,
    clientRoster: User[],
): User | undefined {
    return resolveUserById(order.ordered_by_id, clientRoster);
}

export function collectAssigneesFromOrder(order: ApiOrder): OrderAssignee[] {
    if (order.collaborators?.length) {
        return order.collaborators;
    }

    const seen = new Set<number>();
    const result: OrderAssignee[] = [];

    for (const item of order.order_items ?? []) {
        for (const assignee of item.assignees ?? []) {
            if (seen.has(assignee.id)) continue;
            seen.add(assignee.id);
            result.push(assignee);
        }
    }

    return result;
}

export function resolveAssigneesForOrder(
    order: ApiOrder,
    collaboratorRoster: User[],
): User[] {
    return collectAssigneesFromOrder(order).map((a) =>
        assigneeToUser(a, collaboratorRoster),
    );
}

export function orderMatchesClientFilter(
    order: ApiOrder,
    clientIds: number[],
): boolean {
    if (clientIds.length === 0) {
        return true;
    }

    if (order.is_demo) {
        return false;
    }

    const orderedById = order.ordered_by_id;
    return (
        orderedById != null && clientIds.includes(orderedById)
    );
}

export function orderMatchesCollaboratorFilter(
    order: ApiOrder,
    collaboratorRoster: User[],
    options: {
        myCollaborators: boolean;
        collaboratorIds: number[];
        authUserId: number;
    },
): boolean {
    const assignees = resolveAssigneesForOrder(order, collaboratorRoster);

    if (options.myCollaborators) {
        return assignees.some((u) => u.id === options.authUserId);
    }

    if (options.collaboratorIds.length === 0) {
        return true;
    }

    return assignees.some((u) => options.collaboratorIds.includes(u.id));
}

export function sanitizeFilterUserIds(
    clientIds: number[],
    collaboratorIds: number[],
    clientRoster: User[],
    collaboratorRoster: User[],
): { clientIds: number[]; collaboratorIds: number[] } {
    const clientIdSet = new Set(clientRoster.map((u) => u.id));
    const collaboratorIdSet = new Set(collaboratorRoster.map((u) => u.id));

    return {
        clientIds: clientIds.filter((id) => clientIdSet.has(id)),
        collaboratorIds: collaboratorIds.filter((id) =>
            collaboratorIdSet.has(id),
        ),
    };
}
