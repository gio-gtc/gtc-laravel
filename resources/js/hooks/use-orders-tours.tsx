import { buildFilterCacheKey } from '@/lib/orders/global-dashboard-filters';
import {
    fetchTourOptions,
    fetchTourOrders,
    fetchToursPage,
    hasMoreTours,
} from '@/lib/orders/tours-api';
import type {
    GlobalDashboardFilters,
    IndexOrder,
    TourHeader,
    TourOption,
    ToursPaginationMeta,
} from '@/types/orders-api';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from 'react';

// --- Accordion feed (paginated tour headers) ---

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

// --- Accordion order rows (lazy load + TTL cache) ---

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

function emptyAccordionEntry(): TourAccordionEntry {
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
                    ...emptyAccordionEntry(),
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

// --- Dropdown options (global cache) ---

type TourOptionsContextValue = {
    options: TourOption[];
    isLoading: boolean;
    error?: string;
    loadTourOptions: () => void;
    invalidateTourOptions: () => void;
};

const TourOptionsContext = createContext<TourOptionsContextValue | null>(null);

export function TourOptionsProvider({ children }: { children: ReactNode }) {
    const [options, setOptions] = useState<TourOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const fetchStartedRef = useRef(false);
    const abortRef = useRef<AbortController | null>(null);

    const loadTourOptions = useCallback(() => {
        if (options.length > 0) {
            return;
        }

        if (fetchStartedRef.current) {
            return;
        }

        fetchStartedRef.current = true;
        setIsLoading(true);
        setError(undefined);

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        void fetchTourOptions(controller.signal)
            .then((rows) => {
                setOptions(rows);
            })
            .catch((fetchError: unknown) => {
                fetchStartedRef.current = false;
                if (
                    fetchError instanceof DOMException &&
                    fetchError.name === 'AbortError'
                ) {
                    return;
                }
                setError('Could not load tours.');
            })
            .finally(() => {
                if (abortRef.current === controller) {
                    abortRef.current = null;
                }
                setIsLoading(false);
            });
    }, [options.length]);

    const invalidateTourOptions = useCallback(() => {
        abortRef.current?.abort();
        abortRef.current = null;
        fetchStartedRef.current = false;
        setOptions([]);
        setError(undefined);
        setIsLoading(false);
    }, []);

    return (
        <TourOptionsContext.Provider
            value={{
                options,
                isLoading,
                error,
                loadTourOptions,
                invalidateTourOptions,
            }}
        >
            {children}
        </TourOptionsContext.Provider>
    );
}

export function useTourOptions(): TourOptionsContextValue {
    const ctx = useContext(TourOptionsContext);
    if (!ctx) {
        throw new Error(
            'useTourOptions must be used within TourOptionsProvider',
        );
    }
    return ctx;
}
