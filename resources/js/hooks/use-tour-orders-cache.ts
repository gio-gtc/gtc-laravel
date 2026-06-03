import { useCallback, useEffect, useRef, useState } from 'react';
import { buildFilterCacheKey } from '@/lib/orders/global-dashboard-filters';
import { fetchTourOrders } from '@/lib/orders/orders-api-client';
import type { GlobalDashboardFilters, IndexOrder } from '@/types/orders-api';

type TourOrdersCache = Record<number, IndexOrder[]>;

export function useTourOrdersCache(filters: GlobalDashboardFilters) {
    const [ordersByTour, setOrdersByTour] = useState<TourOrdersCache>({});
    const cacheRef = useRef(ordersByTour);
    cacheRef.current = ordersByTour;

    const [loadingTourIds, setLoadingTourIds] = useState<Set<number>>(
        () => new Set(),
    );
    const [errorsByTour, setErrorsByTour] = useState<Record<number, string>>(
        {},
    );
    const filterKeyRef = useRef(buildFilterCacheKey(filters));
    const abortControllersRef = useRef<Map<number, AbortController>>(new Map());

    useEffect(() => {
        const nextKey = buildFilterCacheKey(filters);
        if (nextKey !== filterKeyRef.current) {
            filterKeyRef.current = nextKey;
            abortControllersRef.current.forEach((c) => c.abort());
            abortControllersRef.current.clear();
            setOrdersByTour({});
            setErrorsByTour({});
            setLoadingTourIds(new Set());
        }
    }, [filters]);

    const clearCache = useCallback(() => {
        abortControllersRef.current.forEach((c) => c.abort());
        abortControllersRef.current.clear();
        setOrdersByTour({});
        setErrorsByTour({});
        setLoadingTourIds(new Set());
    }, []);

    const loadTourOrders = useCallback(
        async (tourId: number, force = false) => {
            if (!force && cacheRef.current[tourId] !== undefined) {
                return cacheRef.current[tourId];
            }

            abortControllersRef.current.get(tourId)?.abort();
            const controller = new AbortController();
            abortControllersRef.current.set(tourId, controller);

            setLoadingTourIds((prev) => new Set(prev).add(tourId));
            setErrorsByTour((prev) => {
                const next = { ...prev };
                delete next[tourId];
                return next;
            });

            try {
                const orders = await fetchTourOrders(
                    tourId,
                    filters,
                    controller.signal,
                );
                setOrdersByTour((prev) => ({ ...prev, [tourId]: orders }));
                return orders;
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return undefined;
                }
                setErrorsByTour((prev) => ({
                    ...prev,
                    [tourId]: 'Could not load orders.',
                }));
                return undefined;
            } finally {
                abortControllersRef.current.delete(tourId);
                setLoadingTourIds((prev) => {
                    const next = new Set(prev);
                    next.delete(tourId);
                    return next;
                });
            }
        },
        [filters],
    );

    const reloadTour = useCallback(
        async (tourId: number) => loadTourOrders(tourId, true),
        [loadTourOrders],
    );

    return {
        ordersByTour,
        loadingTourIds,
        errorsByTour,
        loadTourOrders,
        reloadTour,
        clearCache,
    };
}
