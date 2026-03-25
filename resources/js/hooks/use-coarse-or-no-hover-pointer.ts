import { useEffect, useState } from 'react';

const QUERY = '(hover: none), (pointer: coarse)';

/**
 * True for touch-first / coarse pointers where sidebar uses a tap toggle instead of hover.
 */
export function useCoarseOrNoHoverPointer(): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia(QUERY);
        const update = () => setMatches(mq.matches);
        update();
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, []);

    return matches;
}
