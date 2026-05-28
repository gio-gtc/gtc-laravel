import type { ApiOrder } from '@/types/orders-api';
import type { User } from '@/types';
import {
    orderMatchesCollaboratorFilter as orderMatchesCollaboratorFilterImpl,
    orderMatchesClientFilter,
    resolveAssigneesForOrder,
    resolveClientForOrder,
} from '@/lib/orders/orders-filter-users';

export {
    orderMatchesClientFilter,
    resolveClientForOrder,
    resolveAssigneesForOrder,
} from '@/lib/orders/orders-filter-users';

export function getAssigneesForOrder(
    order: ApiOrder,
    collaboratorRoster: User[],
): User[] {
    return resolveAssigneesForOrder(order, collaboratorRoster);
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
    return orderMatchesCollaboratorFilterImpl(
        order,
        collaboratorRoster,
        options,
    );
}
