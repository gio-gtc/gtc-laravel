import { useCallback, useEffect, useRef, useState } from 'react';
import { buildFilterCacheKey } from '@/lib/orders/global-dashboard-filters';
import { fetchTourOrders } from '@/lib/orders/orders-api-client';
import type { GlobalDashboardFilters, IndexOrder } from '@/types/orders-api';

export type TourAccordionEntry = {
    orders?: IndexOrder[];
    fetchedAt?: number;
    isExpanded: boolean;
    isLoading: boolean;
    error?: string;
};

export type TourAccordionState = Record<number, TourAccordionEntry>;

const TOUR_ORDERS_CACHE_TTL_MS = 5 * 60 * 1000;

function isCacheFresh(fetchedAt: number): boolean {
    return Date.now() - fetchedAt < TOUR_ORDERS_CACHE_TTL_MS;
}

function emptyEntry(): TourAccordionEntry {
    return {
        isExpanded: false,
        isLoading: false,
    };
}

export function useTourOrdersCache(filters: GlobalDashboardFilters) {
    const [tourAccordionState, setTourAccordionState] =
        useState<TourAccordionState>({});
    const stateRef = useRef(tourAccordionState);
    stateRef.current = tourAccordionState;

    const filterKeyRef = useRef(buildFilterCacheKey(filters));
    const abortControllersRef = useRef<Map<number, AbortController>>(new Map());
    const inFlightRef = useRef<
        Map<number, Promise<IndexOrder[] | undefined>>
    >(new Map());
    const filtersRef = useRef(filters);
    filtersRef.current = filters;

    const patchTourEntry = useCallback(
        (tourId: number, patch: Partial<TourAccordionEntry>) => {
            setTourAccordionState((prev) => ({
                ...prev,
                [tourId]: {
                    ...emptyEntry(),
                    ...prev[tourId],
                    ...patch,
                },
            }));
        },
        [],
    );

    const clearInFlight = useCallback(() => {
        abortControllersRef.current.forEach((c) => c.abort());
        abortControllersRef.current.clear();
        inFlightRef.current.clear();
    }, []);

    useEffect(() => {
        const nextKey = buildFilterCacheKey(filters);
        if (nextKey !== filterKeyRef.current) {
            filterKeyRef.current = nextKey;
            clearInFlight();
            setTourAccordionState({});
        }
    }, [filters, clearInFlight]);

    const executeFetch = useCallback(
        (
            tourId: number,
            options: { showLoading: boolean },
        ): Promise<IndexOrder[] | undefined> => {
            const { showLoading } = options;

            abortControllersRef.current.get(tourId)?.abort();

            const controller = new AbortController();
            abortControllersRef.current.set(tourId, controller);

            if (showLoading) {
                patchTourEntry(tourId, { isLoading: true, error: undefined });
            } else {
                patchTourEntry(tourId, { error: undefined });
            }

            let promise!: Promise<IndexOrder[] | undefined>;
            promise = (async () => {
                try {
                    const orders = await fetchTourOrders(
                        tourId,
                        filtersRef.current,
                        controller.signal,
                    );
                    patchTourEntry(tourId, {
                        orders,
                        fetchedAt: Date.now(),
                        isLoading: false,
                        error: undefined,
                    });
                    return orders;
                } catch (error) {
                    if (
                        error instanceof DOMException &&
                        error.name === 'AbortError'
                    ) {
                        return undefined;
                    }
                    patchTourEntry(tourId, {
                        isLoading: false,
                        error: 'Could not load orders.',
                    });
                    return undefined;
                } finally {
                    abortControllersRef.current.delete(tourId);
                    if (inFlightRef.current.get(tourId) === promise) {
                        inFlightRef.current.delete(tourId);
                    }
                }
            })();

            inFlightRef.current.set(tourId, promise);
            return promise;
        },
        [patchTourEntry],
    );

    const loadTourOrders = useCallback(
        async (
            tourId: number,
            force = false,
        ): Promise<IndexOrder[] | undefined> => {
            const entry = stateRef.current[tourId];
            const hasOrders = entry?.orders !== undefined;
            const fetchedAt = entry?.fetchedAt;

            if (!force && hasOrders && fetchedAt !== undefined) {
                if (isCacheFresh(fetchedAt)) {
                    return entry.orders;
                }

                if (!inFlightRef.current.has(tourId)) {
                    void executeFetch(tourId, { showLoading: false });
                }
                return entry.orders;
            }

            const existing = inFlightRef.current.get(tourId);
            if (!force && existing) {
                return existing;
            }

            const showLoading = !hasOrders;
            return executeFetch(tourId, { showLoading });
        },
        [executeFetch],
    );

    const expandTour = useCallback(
        (tourId: number, options?: { force?: boolean }) => {
            patchTourEntry(tourId, { isExpanded: true });
            void loadTourOrders(tourId, options?.force ?? false);
        },
        [loadTourOrders, patchTourEntry],
    );

    const toggleTourExpansion = useCallback(
        (tourId: number) => {
            const entry = stateRef.current[tourId];

            if (entry?.isExpanded) {
                patchTourEntry(tourId, { isExpanded: false });
                return;
            }

            patchTourEntry(tourId, { isExpanded: true });
            void loadTourOrders(tourId, false);
        },
        [loadTourOrders, patchTourEntry],
    );

    const clearCache = useCallback(() => {
        clearInFlight();
        setTourAccordionState({});
    }, [clearInFlight]);

    const reloadTour = useCallback(
        async (tourId: number) => loadTourOrders(tourId, true),
        [loadTourOrders],
    );

    const getTourEntry = useCallback(
        (tourId: number): TourAccordionEntry | undefined =>
            tourAccordionState[tourId],
        [tourAccordionState],
    );

    const isTourExpanded = useCallback(
        (tourId: number): boolean =>
            tourAccordionState[tourId]?.isExpanded ?? false,
        [tourAccordionState],
    );

    const getTourOrders = useCallback(
        (tourId: number): IndexOrder[] | undefined =>
            tourAccordionState[tourId]?.orders,
        [tourAccordionState],
    );

    return {
        tourAccordionState,
        getTourEntry,
        isTourExpanded,
        getTourOrders,
        toggleTourExpansion,
        expandTour,
        loadTourOrders,
        reloadTour,
        clearCache,
    };
}
