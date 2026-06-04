import { useCallback, useEffect, useRef, type RefObject } from 'react';

const PREFETCH_DEBOUNCE_MS = 150;

export function useDebouncedTourPrefetch(
    prefetch: (tourId: number) => void,
) {
    const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
        new Map(),
    );
    const prefetchRef = useRef(prefetch);
    prefetchRef.current = prefetch;

    useEffect(() => {
        const timers = timersRef.current;
        return () => {
            timers.forEach((timer) => clearTimeout(timer));
            timers.clear();
        };
    }, []);

    const schedulePrefetch = useCallback((tourId: number) => {
        const existing = timersRef.current.get(tourId);
        if (existing) {
            clearTimeout(existing);
        }

        const timer = setTimeout(() => {
            timersRef.current.delete(tourId);
            prefetchRef.current(tourId);
        }, PREFETCH_DEBOUNCE_MS);

        timersRef.current.set(tourId, timer);
    }, []);

    const cancelScheduledPrefetch = useCallback((tourId: number) => {
        const existing = timersRef.current.get(tourId);
        if (existing) {
            clearTimeout(existing);
            timersRef.current.delete(tourId);
        }
    }, []);

    return { schedulePrefetch, cancelScheduledPrefetch };
}

export function useTourHeaderViewportPrefetch(
    nodeRef: RefObject<HTMLElement | null>,
    options: {
        tourId: number;
        enabled: boolean;
        onPrefetch: (tourId: number) => void;
    },
) {
    const onPrefetchRef = useRef(options.onPrefetch);
    onPrefetchRef.current = options.onPrefetch;

    useEffect(() => {
        if (!options.enabled) {
            return;
        }

        const node = nodeRef.current;
        if (!node) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    onPrefetchRef.current(options.tourId);
                }
            },
            { rootMargin: '100px' },
        );

        observer.observe(node);

        return () => observer.disconnect();
    }, [nodeRef, options.enabled, options.tourId]);
}
