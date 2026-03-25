import { type TourVenueStatusValue } from '@/types';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'gtc-orders-filters';

function normalizeStoredStatuses(
    raw: unknown,
    validTourVenueStatusIds: number[],
): TourVenueStatusValue[] {
    if (!Array.isArray(raw)) return [];
    return raw.filter(
        (s): s is TourVenueStatusValue =>
            typeof s === 'number' && validTourVenueStatusIds.includes(s),
    );
}

export type OrdersFilterState = {
    clientIds: number[];
    collaboratorIds: number[];
    myClients: boolean;
    myCollaborators: boolean;
    statuses: TourVenueStatusValue[];
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

function loadFilters(validTourVenueStatusIds: number[]): OrdersFilterState {
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
            statuses: normalizeStoredStatuses(
                parsed.statuses,
                validTourVenueStatusIds,
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

export function useOrdersFilters(validTourVenueStatusIds: number[]) {
    const [filters, setFilters] = useState<OrdersFilterState>(() =>
        loadFilters(validTourVenueStatusIds),
    );

    useEffect(() => {
        saveFilters(filters);
    }, [filters]);

    return [filters, setFilters] as const;
}
