import { type OrdersFilterState } from '@/hooks/use-orders-filters';
import {
    getAssigneesForOrder,
    orderMatchesCollaboratorFilter,
} from '@/lib/orders/orders-filter-users';
import type { ApiOrder, GroupedOrders } from '@/types/orders-api';
import type { User } from '@/types';

/** Demo row + filter context, or null when the demo row should not render. */
export function getVisibleOrderDemoContext(
    group: GroupedOrders,
    options: {
        hasOrderLevelFilter: boolean;
        hasClientFilter: boolean;
        hasCollaboratorFilter: boolean;
        filters: OrdersFilterState;
        authUserId: number;
        searchQuery: string;
        collaboratorRoster: User[];
    },
): { demoOrder: ApiOrder } | null {
    if (options.hasOrderLevelFilter) return null;

    const demoOrder = group.orders.find((o) => o.is_demo);
    if (!demoOrder) return null;

    if (options.hasClientFilter) {
        return null;
    }

    const demoMatchesCollaborator =
        !options.hasCollaboratorFilter ||
        orderMatchesCollaboratorFilter(demoOrder, options.collaboratorRoster, {
            myCollaborators: options.filters.myCollaborators,
            collaboratorIds: options.filters.collaboratorIds,
            authUserId: options.authUserId,
        });

    const q = options.searchQuery.toLowerCase().trim();
    const assigneeNames = getAssigneesForOrder(
        demoOrder,
        options.collaboratorRoster,
    )
        .map((a) => a.name.toLowerCase())
        .join(' ');
    const searchMatchesDemo =
        !q ||
        'demo'.includes(q) ||
        assigneeNames.includes(q);

    if (!demoMatchesCollaborator || !searchMatchesDemo) {
        return null;
    }

    return { demoOrder };
}
