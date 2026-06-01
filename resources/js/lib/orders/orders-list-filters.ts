import {
    getAssigneesForOrder,
    orderMatchesClientFilter,
    orderMatchesCollaboratorFilter,
    resolveClientForOrder,
} from '@/lib/orders/orders-filter-users';
import type { ApiOrder, GroupedOrders, OrderStatus } from '@/types/orders-api';
import type { User } from '@/types';

export const USA_COUNTRY_ID = 1;

export type OrdersListFilterState = {
    clientIds: number[];
    collaboratorIds: number[];
    myCollaborators: boolean;
    statuses: OrderStatus[];
    country: { us: boolean; international: boolean };
};

export function orderMatchesSearch(
    order: ApiOrder,
    query: string,
    clientUsers: User[],
    collaboratorUsers: User[],
): boolean {
    if (order.is_demo) {
        const assignees = getAssigneesForOrder(order, collaboratorUsers);
        return (
            'demo'.includes(query) ||
            assignees.some((a) => a.name.toLowerCase().includes(query))
        );
    }

    const venue = order.venue;
    const region = venue
        ? `${venue.city ?? ''}, ${venue.state ?? ''}`
        : '';
    const clientName =
        resolveClientForOrder(order, clientUsers)?.name?.toLowerCase() ?? '';
    const assignees = getAssigneesForOrder(order, collaboratorUsers);

    return (
        region.toLowerCase().includes(query) ||
        (venue?.name?.toLowerCase().includes(query) ?? false) ||
        clientName.includes(query) ||
        assignees.some((a) => a.name.toLowerCase().includes(query))
    );
}

export function filterGroupedOrdersBySearch(
    groupedData: GroupedOrders[],
    searchQuery: string,
    clientUsers: User[],
    collaboratorUsers: User[],
): GroupedOrders[] {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
        return groupedData;
    }

    const query = trimmed.toLowerCase();
    const hasTourMatch = groupedData.some((g) =>
        g.tour.name.toLowerCase().includes(query),
    );

    if (hasTourMatch) {
        return groupedData.filter((g) =>
            g.tour.name.toLowerCase().includes(query),
        );
    }

    return groupedData
        .filter((g) =>
            g.orders.some((order) =>
                orderMatchesSearch(order, query, clientUsers, collaboratorUsers),
            ),
        )
        .map((g) => ({
            ...g,
            orders: g.orders.filter((order) =>
                orderMatchesSearch(order, query, clientUsers, collaboratorUsers),
            ),
        }));
}

export function orderMatchesAdvancedFilters(
    order: ApiOrder,
    filters: OrdersListFilterState,
    clientUsers: User[],
    collaboratorUsers: User[],
    authUserId: number,
): boolean {
    const hasClientFilter = filters.clientIds.length > 0;
    const hasCollaboratorFilter =
        filters.collaboratorIds.length > 0 || filters.myCollaborators;
    const hasStatusFilter = filters.statuses.length > 0;
    const hasCountryFilter =
        !filters.country.us || !filters.country.international;

    if (order.is_demo) {
        if (hasClientFilter || hasCountryFilter) {
            return false;
        }
    } else {
        if (
            hasClientFilter &&
            !orderMatchesClientFilter(order, filters.clientIds)
        ) {
            return false;
        }

        if (hasCountryFilter && order.venue) {
            const isUS = order.venue.country_id === USA_COUNTRY_ID;
            const usMatch = filters.country.us && isUS;
            const internationalMatch =
                filters.country.international && !isUS;
            if (!usMatch && !internationalMatch) {
                return false;
            }
        }
    }

    if (hasCollaboratorFilter) {
        if (
            !orderMatchesCollaboratorFilter(order, collaboratorUsers, {
                myCollaborators: filters.myCollaborators,
                collaboratorIds: filters.collaboratorIds,
                authUserId,
            })
        ) {
            return false;
        }
    }

    if (hasStatusFilter && !filters.statuses.includes(order.status)) {
        return false;
    }

    return true;
}

export function filterGroupedOrdersByAdvanced(
    searchFiltered: GroupedOrders[],
    filters: OrdersListFilterState,
    clientUsers: User[],
    collaboratorUsers: User[],
    authUserId: number,
): GroupedOrders[] {
    const hasClientFilter = filters.clientIds.length > 0;
    const hasCollaboratorFilter =
        filters.collaboratorIds.length > 0 || filters.myCollaborators;
    const hasStatusFilter = filters.statuses.length > 0;
    const hasCountryFilter =
        !filters.country.us || !filters.country.international;

    if (
        !hasClientFilter &&
        !hasCollaboratorFilter &&
        !hasStatusFilter &&
        !hasCountryFilter
    ) {
        return searchFiltered;
    }

    const matches = (order: ApiOrder) =>
        orderMatchesAdvancedFilters(
            order,
            filters,
            clientUsers,
            collaboratorUsers,
            authUserId,
        );

    return searchFiltered
        .filter((g) => g.orders.some(matches))
        .map((g) => ({
            ...g,
            orders: g.orders.filter(matches),
        }));
}

export function filterGroupedOrders(
    groupedData: GroupedOrders[],
    searchQuery: string,
    filters: OrdersListFilterState,
    clientUsers: User[],
    collaboratorUsers: User[],
    authUserId: number,
): GroupedOrders[] {
    const searchFiltered = filterGroupedOrdersBySearch(
        groupedData,
        searchQuery,
        clientUsers,
        collaboratorUsers,
    );

    return filterGroupedOrdersByAdvanced(
        searchFiltered,
        filters,
        clientUsers,
        collaboratorUsers,
        authUserId,
    );
}
