import { useSyncExternalStore } from 'react';

const MOBILE_BREAKPOINT = 768;
const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;
const TOUCH_LANDSCAPE_QUERY = '(pointer: coarse) and (orientation: landscape)';

function getMediaQueries() {
    if (typeof window === 'undefined') return [];
    return [
        window.matchMedia(MOBILE_QUERY),
        window.matchMedia(TOUCH_LANDSCAPE_QUERY),
    ];
}

function mediaQueryListener(callback: () => void) {
    const mediaQueries = getMediaQueries();
    mediaQueries.forEach((mql) => mql.addEventListener('change', callback));

    return () => {
        mediaQueries.forEach((mql) =>
            mql.removeEventListener('change', callback),
        );
    };
}

function isCompactTouchViewport() {
    const [mobileWidthMql, touchLandscapeMql] = getMediaQueries();
    return Boolean(mobileWidthMql?.matches || touchLandscapeMql?.matches);
}

export function useIsMobile() {
    return useSyncExternalStore(
        mediaQueryListener,
        isCompactTouchViewport,
        () => false,
    );
}
