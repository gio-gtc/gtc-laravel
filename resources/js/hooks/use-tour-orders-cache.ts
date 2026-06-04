import { useCallback, useEffect, useRef, useState } from 'react';
import { buildFilterCacheKey } from '@/lib/orders/global-dashboard-filters';
import { fetchTourOrders } from '@/lib/orders/orders-api-client';
import type { GlobalDashboardFilters, IndexOrder } from '@/types/orders-api';

type TourOrdersCache = Record<number, IndexOrder[]>;
type FetchIntent = 'prefetch' | 'expand';

const MAX_CONCURRENT_PREFETCH = 2;

export function useTourOrdersCache(filters: GlobalDashboardFilters) {
    const [ordersByTour, setOrdersByTour] = useState<TourOrdersCache>({});
    const cacheRef = useRef(ordersByTour);
    cacheRef.current = ordersByTour;

    const [loadingTourIds, setLoadingTourIds] = useState<Set<number>>(
        () => new Set(),
    );
    const [prefetchingTourIds, setPrefetchingTourIds] = useState<Set<number>>(
        () => new Set(),
    );
    const [errorsByTour, setErrorsByTour] = useState<Record<number, string>>(
        {},
    );

    const filterKeyRef = useRef(buildFilterCacheKey(filters));
    const abortControllersRef = useRef<Map<number, AbortController>>(new Map());
    const inFlightRef = useRef<
        Map<number, Promise<IndexOrder[] | undefined>>
    >(new Map());
    const prefetchQueueRef = useRef<number[]>([]);
    const activePrefetchCountRef = useRef(0);
    const expandRequestedRef = useRef<Set<number>>(new Set());
    const filtersRef = useRef(filters);
    filtersRef.current = filters;

    const resetPrefetchState = useCallback(() => {
        prefetchQueueRef.current = [];
        activePrefetchCountRef.current = 0;
        expandRequestedRef.current.clear();
        setPrefetchingTourIds(new Set());
    }, []);

    const clearInFlight = useCallback(() => {
        abortControllersRef.current.forEach((c) => c.abort());
        abortControllersRef.current.clear();
        inFlightRef.current.clear();
        resetPrefetchState();
    }, [resetPrefetchState]);

    useEffect(() => {
        const nextKey = buildFilterCacheKey(filters);
        if (nextKey !== filterKeyRef.current) {
            filterKeyRef.current = nextKey;
            clearInFlight();
            setOrdersByTour({});
            setErrorsByTour({});
            setLoadingTourIds(new Set());
        }
    }, [filters, clearInFlight]);

    const setIntentLoading = useCallback(
        (tourId: number, intent: FetchIntent, active: boolean) => {
            if (intent === 'expand') {
                setLoadingTourIds((prev) => {
                    const next = new Set(prev);
                    if (active) {
                        next.add(tourId);
                    } else {
                        next.delete(tourId);
                    }
                    return next;
                });
                if (active) {
                    setPrefetchingTourIds((prev) => {
                        if (!prev.has(tourId)) {
                            return prev;
                        }
                        const next = new Set(prev);
                        next.delete(tourId);
                        return next;
                    });
                }
                return;
            }

            setPrefetchingTourIds((prev) => {
                const next = new Set(prev);
                if (active) {
                    next.add(tourId);
                } else {
                    next.delete(tourId);
                }
                return next;
            });
        },
        [],
    );

    const drainPrefetchQueueRef = useRef<() => void>(() => {});

    const runFetch = useCallback(
        async (
            tourId: number,
            force: boolean,
            intent: FetchIntent,
        ): Promise<IndexOrder[] | undefined> => {
            if (!force && cacheRef.current[tourId] !== undefined) {
                return cacheRef.current[tourId];
            }

            const existing = inFlightRef.current.get(tourId);
            if (!force && existing) {
                if (intent === 'expand') {
                    expandRequestedRef.current.add(tourId);
                    setIntentLoading(tourId, 'expand', true);
                }
                return existing;
            }

            if (force) {
                abortControllersRef.current.get(tourId)?.abort();
            }

            const controller = new AbortController();
            abortControllersRef.current.set(tourId, controller);

            if (intent === 'prefetch') {
                activePrefetchCountRef.current += 1;
            }

            setIntentLoading(tourId, intent, true);
            setErrorsByTour((prev) => {
                const next = { ...prev };
                delete next[tourId];
                return next;
            });

            const promise = (async () => {
                try {
                    const orders = await fetchTourOrders(
                        tourId,
                        filtersRef.current,
                        controller.signal,
                    );
                    setOrdersByTour((prev) => ({ ...prev, [tourId]: orders }));
                    return orders;
                } catch (error) {
                    if (
                        error instanceof DOMException &&
                        error.name === 'AbortError'
                    ) {
                        return undefined;
                    }
                    setErrorsByTour((prev) => ({
                        ...prev,
                        [tourId]: 'Could not load orders.',
                    }));
                    return undefined;
                } finally {
                    abortControllersRef.current.delete(tourId);
                    inFlightRef.current.delete(tourId);
                    setIntentLoading(tourId, intent, false);

                    if (expandRequestedRef.current.has(tourId)) {
                        expandRequestedRef.current.delete(tourId);
                        setIntentLoading(tourId, 'expand', false);
                    }

                    if (intent === 'prefetch') {
                        activePrefetchCountRef.current = Math.max(
                            0,
                            activePrefetchCountRef.current - 1,
                        );
                        drainPrefetchQueueRef.current();
                    }
                }
            })();

            inFlightRef.current.set(tourId, promise);
            return promise;
        },
        [setIntentLoading],
    );

    const drainPrefetchQueue = useCallback(() => {
        while (
            activePrefetchCountRef.current < MAX_CONCURRENT_PREFETCH &&
            prefetchQueueRef.current.length > 0
        ) {
            const nextTourId = prefetchQueueRef.current.shift();
            if (nextTourId === undefined) {
                break;
            }

            if (cacheRef.current[nextTourId] !== undefined) {
                continue;
            }

            if (inFlightRef.current.has(nextTourId)) {
                continue;
            }

            void runFetch(nextTourId, false, 'prefetch');
        }
    }, [runFetch]);

    drainPrefetchQueueRef.current = drainPrefetchQueue;

    const prefetchTourOrders = useCallback(
        (tourId: number) => {
            if (cacheRef.current[tourId] !== undefined) {
                return;
            }

            if (inFlightRef.current.has(tourId)) {
                return;
            }

            if (prefetchQueueRef.current.includes(tourId)) {
                return;
            }

            if (activePrefetchCountRef.current >= MAX_CONCURRENT_PREFETCH) {
                prefetchQueueRef.current.push(tourId);
                return;
            }

            void runFetch(tourId, false, 'prefetch');
        },
        [runFetch],
    );

    const loadTourOrders = useCallback(
        async (tourId: number, force = false) =>
            runFetch(tourId, force, 'expand'),
        [runFetch],
    );

    const clearCache = useCallback(() => {
        clearInFlight();
        setOrdersByTour({});
        setErrorsByTour({});
        setLoadingTourIds(new Set());
    }, [clearInFlight]);

    const reloadTour = useCallback(
        async (tourId: number) => loadTourOrders(tourId, true),
        [loadTourOrders],
    );

    return {
        ordersByTour,
        loadingTourIds,
        prefetchingTourIds,
        errorsByTour,
        loadTourOrders,
        prefetchTourOrders,
        reloadTour,
        clearCache,
    };
}
