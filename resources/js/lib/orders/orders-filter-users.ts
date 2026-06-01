import type { ApiOrder, ApiOrderClient, OrderAssignee } from '@/types/orders-api';
import type { User } from '@/types';
import {
    GTC_INTERNAL_ORG_ID,
    isExternalClientUser,
    isGtcStaffUser,
    normalizeUserOrganisationShape,
} from '@/lib/user-organisation';

export { GTC_INTERNAL_ORG_ID };

export function isCollaboratorUser(user: User): boolean {
    return isGtcStaffUser(user);
}

export function isClientUser(user: User): boolean {
    return isExternalClientUser(user);
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

export function apiOrderClientToUser(client: ApiOrderClient): User {
    const first_name =
        typeof client.first_name === 'string' ? client.first_name.trim() : '';
    const last_name =
        typeof client.last_name === 'string' ? client.last_name.trim() : '';
    const email = typeof client.email === 'string' ? client.email.trim() : '';
    const fromParts = [first_name, last_name].filter(Boolean).join(' ');
    const fromName =
        typeof client.name === 'string' ? client.name.trim() : '';
    const displayName = fromParts || fromName || email || `User ${client.id}`;

    let resolvedFirst = first_name;
    let resolvedLast = last_name;
    if (!resolvedFirst && !resolvedLast) {
        const tokens = displayName.split(/\s+/).filter(Boolean);
        resolvedFirst = tokens[0] ?? '';
        resolvedLast = tokens.slice(1).join(' ');
    }

    return normalizeUserOrganisationShape({
        id: client.id,
        name: displayName,
        email,
        email_verified_at: null,
        role: '',
        first_name: resolvedFirst,
        last_name: resolvedLast,
        organisation: { id: 0, name: '' },
    });
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
        organisation: { id: GTC_INTERNAL_ORG_ID, name: '' },
    };
}

export function resolveClientForOrder(
    order: ApiOrder,
    clientRoster: User[],
): User | undefined {
    const embedded = order.client;
    if (embedded != null && typeof embedded.id === 'number') {
        return apiOrderClientToUser(embedded);
    }

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

/** @alias resolveAssigneesForOrder */
export function getAssigneesForOrder(
    order: ApiOrder,
    collaboratorRoster: User[],
): User[] {
    return resolveAssigneesForOrder(order, collaboratorRoster);
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
