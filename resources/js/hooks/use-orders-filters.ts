import { sanitizeFilterUserIds } from '@/lib/orders/orders-filter-users';
import type { User } from '@/types';
import type { OrderStatus, OrderTag } from '@/types/orders-api';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'gtc-orders-filters';

/** Legacy lowercase slugs from pre–Title Case migration. */
const LEGACY_STATUS_SLUG_TO_WIRE: Record<string, OrderStatus> = {
    'new order': 'New Order',
    'in progress': 'In Progress',
    'client review': 'Client Review',
    complete: 'Complete',
    canceled: 'Cancelled',
    cancelled: 'Cancelled',
    Canceled: 'Cancelled',
};

function migrateStoredStatus(
    raw: string,
    validStatuses: OrderStatus[],
): OrderStatus | null {
    const wire = LEGACY_STATUS_SLUG_TO_WIRE[raw] ?? raw;
    return validStatuses.includes(wire as OrderStatus)
        ? (wire as OrderStatus)
        : null;
}

function normalizeStoredStatuses(
    raw: unknown,
    validStatuses: OrderStatus[],
): OrderStatus[] {
    if (!Array.isArray(raw)) {
        return [];
    }

    const seen = new Set<OrderStatus>();
    const result: OrderStatus[] = [];

    for (const entry of raw) {
        if (typeof entry !== 'string') {
            continue;
        }
        const status = migrateStoredStatus(entry, validStatuses);
        if (status && !seen.has(status)) {
            seen.add(status);
            result.push(status);
        }
    }

    return result;
}

export type OrdersFilterState = {
    clientIds: number[];
    collaboratorIds: number[];
    myCollaborators: boolean;
    statuses: OrderStatus[];
    assetTags: OrderTag[];
    country: { us: boolean; international: boolean };
};

export const DEFAULT_FILTERS: OrdersFilterState = {
    clientIds: [],
    collaboratorIds: [],
    myCollaborators: false,
    statuses: [],
    assetTags: [],
    country: { us: true, international: true },
};

type LoadFiltersOptions = {
    validStatuses: OrderStatus[];
};

const VALID_ASSET_TAGS: OrderTag[] = ['Audio', 'Art'];

function normalizeStoredAssetTags(raw: unknown): OrderTag[] {
    if (!Array.isArray(raw)) {
        return [];
    }

    const seen = new Set<OrderTag>();
    const result: OrderTag[] = [];

    for (const entry of raw) {
        if (
            typeof entry === 'string' &&
            VALID_ASSET_TAGS.includes(entry as OrderTag) &&
            !seen.has(entry as OrderTag)
        ) {
            seen.add(entry as OrderTag);
            result.push(entry as OrderTag);
        }
    }

    return result;
}

function loadFiltersFromStorage(
    options: LoadFiltersOptions,
): OrdersFilterState {
    if (typeof window === 'undefined') {
        return DEFAULT_FILTERS;
    }

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return DEFAULT_FILTERS;
        }

        const parsed = JSON.parse(raw) as Partial<OrdersFilterState>;
        const { clientIds, collaboratorIds } = sanitizeFilterUserIds(
            Array.isArray(parsed.clientIds) ? parsed.clientIds : [],
            Array.isArray(parsed.collaboratorIds) ? parsed.collaboratorIds : [],
            [],
            { sanitizeCollaborators: false },
        );

        return {
            clientIds,
            collaboratorIds,
            myCollaborators: Boolean(parsed.myCollaborators),
            statuses: normalizeStoredStatuses(
                parsed.statuses,
                options.validStatuses,
            ),
            assetTags: normalizeStoredAssetTags(parsed.assetTags),
            country: {
                us: parsed.country?.us !== false,
                international: parsed.country?.international !== false,
            },
        };
    } catch {
        return DEFAULT_FILTERS;
    }
}

function saveFiltersToStorage(filters: OrdersFilterState): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch {
        // ignore quota / private mode
    }
}

export function useOrdersFilters(
    validStatuses: OrderStatus[],
    collaboratorUsers: User[],
    staffRosterLoaded: boolean,
): [
    OrdersFilterState,
    (
        next:
            | OrdersFilterState
            | ((prev: OrdersFilterState) => OrdersFilterState),
    ) => void,
] {
    const [filters, setFilters] = useState<OrdersFilterState>(() =>
        loadFiltersFromStorage({
            validStatuses,
        }),
    );

    useEffect(() => {
        saveFiltersToStorage(filters);
    }, [filters]);

    useEffect(() => {
        if (!staffRosterLoaded) {
            return;
        }

        setFilters((prev) => {
            const { collaboratorIds } = sanitizeFilterUserIds(
                prev.clientIds,
                prev.collaboratorIds,
                collaboratorUsers,
            );

            if (
                collaboratorIds.length === prev.collaboratorIds.length &&
                collaboratorIds.every((id, i) => id === prev.collaboratorIds[i])
            ) {
                return prev;
            }

            return {
                ...prev,
                collaboratorIds,
            };
        });
    }, [collaboratorUsers, staffRosterLoaded]);

    return [filters, setFilters];
}
