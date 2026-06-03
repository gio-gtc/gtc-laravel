import { useCallback, useRef, useState } from 'react';
import {
    fetchToursPage,
    hasMoreTours,
} from '@/lib/orders/orders-api-client';
import type {
    GlobalDashboardFilters,
    TourHeader,
    ToursPaginationMeta,
} from '@/types/orders-api';
import { useEffect } from 'react';

export function useTourFeed(
    initialTours: TourHeader[],
    initialPagination: ToursPaginationMeta,
) {
    const [tours, setTours] = useState<TourHeader[]>(initialTours);
    const [pagination, setPagination] =
        useState<ToursPaginationMeta>(initialPagination);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const loadingRef = useRef(false);
    const filtersRef = useRef<GlobalDashboardFilters>({});
    const abortRef = useRef<AbortController | null>(null);
    const requestIdRef = useRef(0);

    const loadNextPage = useCallback(async () => {
        if (loadingRef.current || !hasMoreTours(pagination)) {
            return;
        }

        loadingRef.current = true;
        setIsLoadingMore(true);
        setLoadError(null);

        const requestId = ++requestIdRef.current;
        const controller = new AbortController();
        abortRef.current?.abort();
        abortRef.current = controller;

        try {
            const nextPage = pagination.current_page + 1;
            const response = await fetchToursPage(
                nextPage,
                filtersRef.current,
                controller.signal,
            );

            if (requestId !== requestIdRef.current) {
                return;
            }

            setTours((prev) => {
                const seen = new Set(prev.map((t) => t.id));
                const appended = response.data.filter((t) => !seen.has(t.id));
                return [...prev, ...appended];
            });
            setPagination({
                current_page: response.current_page,
                last_page: response.last_page,
                total: response.total,
                next_page_url: response.next_page_url,
            });
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return;
            }
            if (requestId === requestIdRef.current) {
                setLoadError('Failed to load more tours. Click to retry.');
            }
        } finally {
            loadingRef.current = false;
            if (requestId === requestIdRef.current) {
                setIsLoadingMore(false);
            }
        }
    }, [pagination]);

    const resetFeed = useCallback(async (filters: GlobalDashboardFilters) => {
        filtersRef.current = filters;
        loadingRef.current = true;
        setIsResetting(true);
        setLoadError(null);

        const requestId = ++requestIdRef.current;
        const controller = new AbortController();
        abortRef.current?.abort();
        abortRef.current = controller;

        try {
            const response = await fetchToursPage(1, filters, controller.signal);

            if (requestId !== requestIdRef.current) {
                return;
            }

            setTours(response.data);
            setPagination({
                current_page: response.current_page,
                last_page: response.last_page,
                total: response.total,
                next_page_url: response.next_page_url,
            });
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return;
            }
            if (requestId === requestIdRef.current) {
                setLoadError('Could not load tours.');
                setTours([]);
                setPagination({
                    current_page: 1,
                    last_page: 1,
                    total: 0,
                    next_page_url: null,
                });
            }
        } finally {
            loadingRef.current = false;
            if (requestId === requestIdRef.current) {
                setIsResetting(false);
            }
        }
    }, []);

    return {
        tours,
        pagination,
        isLoadingMore,
        isResetting,
        loadError,
        loadNextPage,
        resetFeed,
        hasMore: hasMoreTours(pagination),
        clearLoadError: () => setLoadError(null),
    };
}

export function useInfiniteScrollTrigger(
    onTrigger: () => void,
    enabled: boolean,
) {
    const sentinelRef = useRef<HTMLTableRowElement | null>(null);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        const node = sentinelRef.current;
        if (!node) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((e) => e.isIntersecting)) {
                    onTrigger();
                }
            },
            { rootMargin: '200px' },
        );

        observer.observe(node);

        return () => observer.disconnect();
    }, [enabled, onTrigger]);

    return sentinelRef;
}
