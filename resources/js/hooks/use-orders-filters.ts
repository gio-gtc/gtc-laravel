import { useEffect, useState } from 'react';
import { type TourVenue } from '@/types';

const STORAGE_KEY = 'gtc-orders-filters';

export type OrdersFilterState = {
    clientIds: number[];
    collaboratorIds: number[];
    myClients: boolean;
    myCollaborators: boolean;
    statuses: TourVenue['status'][];
    country: { us: boolean; international: boolean };
};

export const DEFAULT_FILTERS: OrdersFilterState = {
    clientIds: [],
    collaboratorIds: [],
    myClients: false,
    myCollaborators: false,
    statuses: [],
    country: { us: true, international: true },
};

const VALID_STATUSES: TourVenue['status'][] = [
    'completed',
    'in-progress',
    'pending',
    'paused',
    'edit',
];

function loadFilters(): OrdersFilterState {
    if (typeof window === 'undefined') return DEFAULT_FILTERS;
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return DEFAULT_FILTERS;
        const parsed = JSON.parse(stored) as Partial<OrdersFilterState>;
        return {
            clientIds: Array.isArray(parsed.clientIds)
                ? parsed.clientIds.filter((id) => typeof id === 'number')
                : DEFAULT_FILTERS.clientIds,
            collaboratorIds: Array.isArray(parsed.collaboratorIds)
                ? parsed.collaboratorIds.filter((id) => typeof id === 'number')
                : DEFAULT_FILTERS.collaboratorIds,
            myClients:
                typeof parsed.myClients === 'boolean'
                    ? parsed.myClients
                    : DEFAULT_FILTERS.myClients,
            myCollaborators:
                typeof parsed.myCollaborators === 'boolean'
                    ? parsed.myCollaborators
                    : DEFAULT_FILTERS.myCollaborators,
            statuses: Array.isArray(parsed.statuses)
                ? parsed.statuses.filter((s) =>
                      VALID_STATUSES.includes(s as TourVenue['status']),
                  )
                : DEFAULT_FILTERS.statuses,
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

export function useOrdersFilters() {
    const [filters, setFilters] = useState<OrdersFilterState>(loadFilters);

    useEffect(() => {
        saveFilters(filters);
    }, [filters]);

    return [filters, setFilters] as const;
}
