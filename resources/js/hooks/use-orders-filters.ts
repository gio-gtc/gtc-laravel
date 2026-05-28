import { sanitizeFilterUserIds } from '@/lib/orders/orders-filter-users';
import type { OrderItemStatus } from '@/types/orders-api';
import type { User } from '@/types';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'gtc-orders-filters';

function normalizeStoredStatuses(
    raw: unknown,
    validStatuses: OrderItemStatus[],
): OrderItemStatus[] {
    if (!Array.isArray(raw)) return [];
    return raw.filter(
        (s): s is OrderItemStatus =>
            typeof s === 'string' && validStatuses.includes(s as OrderItemStatus),
    );
}

export type OrdersFilterState = {
    clientIds: number[];
    collaboratorIds: number[];
    myCollaborators: boolean;
    statuses: OrderItemStatus[];
    country: { us: boolean; international: boolean };
};

export const DEFAULT_FILTERS: OrdersFilterState = {
    clientIds: [],
    collaboratorIds: [],
    myCollaborators: false,
    statuses: [],
    country: { us: true, international: true },
};

type LoadFiltersOptions = {
    validStatuses: OrderItemStatus[];
    clientUsers: User[];
    collaboratorUsers: User[];
};

function loadFilters(options: LoadFiltersOptions): OrdersFilterState {
    if (typeof window === 'undefined') return DEFAULT_FILTERS;
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return DEFAULT_FILTERS;
        const parsed = JSON.parse(stored) as Partial<OrdersFilterState>;

        const rawClientIds = Array.isArray(parsed.clientIds)
            ? parsed.clientIds.filter((id) => typeof id === 'number')
            : DEFAULT_FILTERS.clientIds;
        const rawCollaboratorIds = Array.isArray(parsed.collaboratorIds)
            ? parsed.collaboratorIds.filter((id) => typeof id === 'number')
            : DEFAULT_FILTERS.collaboratorIds;

        const { clientIds, collaboratorIds } = sanitizeFilterUserIds(
            rawClientIds,
            rawCollaboratorIds,
            options.clientUsers,
            options.collaboratorUsers,
        );

        return {
            clientIds,
            collaboratorIds,
            myCollaborators:
                typeof parsed.myCollaborators === 'boolean'
                    ? parsed.myCollaborators
                    : DEFAULT_FILTERS.myCollaborators,
            statuses: normalizeStoredStatuses(
                parsed.statuses,
                options.validStatuses,
            ),
            country:
                parsed.country &&
                typeof parsed.country.us === 'boolean' &&
                typeof parsed.country.international === 'boolean'
                    ? parsed.country
                    : DEFAULT_FILTERS.country,
        };
    } catch {
        return DEFAULT_FILTERS;
    }
}

function saveFilters(state: OrdersFilterState): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // Ignore storage errors
    }
}

export function useOrdersFilters(
    validStatuses: OrderItemStatus[],
    clientUsers: User[],
    collaboratorUsers: User[],
) {
    const [filters, setFilters] = useState<OrdersFilterState>(() =>
        loadFilters({
            validStatuses,
            clientUsers,
            collaboratorUsers,
        }),
    );

    useEffect(() => {
        saveFilters(filters);
    }, [filters]);

    return [filters, setFilters] as const;
}
