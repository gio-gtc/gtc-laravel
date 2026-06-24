import type {
    ApiOrder,
    ApiOrderClient,
    OrderAssignee,
    OrderCollaboratorSource,
} from '@/types/orders-api';
import type { User } from '@/types';
import {
    embedPersonToUser,
    findUserInRoster,
    resolveUserForAvatar,
} from '@/lib/user-for-avatar';
import {
    GTC_INTERNAL_ORG_ID,
    isExternalClientUser,
    isGtcStaffUser,
} from '@/lib/user-organisation';

export { GTC_INTERNAL_ORG_ID };
export {
    embedPersonToUser,
    externalClientEmbedToUser,
    findUserInRoster,
    resolveUserForAvatar,
    staffEmbedToUser,
} from '@/lib/user-for-avatar';
export type { PersonEmbed } from '@/lib/user-for-avatar';

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
    return findUserInRoster(id, roster);
}

export function apiOrderClientToUser(client: ApiOrderClient): User {
    const org = client.organisation ?? {
        id: client.organisation_id ?? 0,
        name: '',
    };

    return embedPersonToUser(client, {
        id: org.id,
        name: org.name,
    });
}

export function assigneeToUser(assignee: OrderAssignee, roster?: User[]): User {
    return resolveUserForAvatar(assignee.id, roster ?? [], assignee);
}

export function orderItemAssigneesToUsers(
    assignees: OrderAssignee[] | undefined,
    roster: User[],
): User[] {
    return (assignees ?? []).map((assignee) => assigneeToUser(assignee, roster));
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

export function collectAssigneesFromOrder(
    order: OrderCollaboratorSource,
): OrderAssignee[] {
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
    order: OrderCollaboratorSource,
    collaboratorRoster: User[],
): User[] {
    return collectAssigneesFromOrder(order).map((a) =>
        assigneeToUser(a, collaboratorRoster),
    );
}

export function sanitizeFilterUserIds(
    clientIds: number[],
    collaboratorIds: number[],
    collaboratorRoster: User[],
    options?: { sanitizeCollaborators?: boolean },
): { clientIds: number[]; collaboratorIds: number[] } {
    const sanitizeCollaborators = options?.sanitizeCollaborators ?? true;

    if (!sanitizeCollaborators || collaboratorRoster.length === 0) {
        return {
            clientIds,
            collaboratorIds,
        };
    }

    const collaboratorIdSet = new Set(collaboratorRoster.map((u) => u.id));

    return {
        clientIds,
        collaboratorIds: collaboratorIds.filter((id) =>
            collaboratorIdSet.has(id),
        ),
    };
}
