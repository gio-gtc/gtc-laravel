import type { TransformerFunction } from 'unpic';

/** Passthrough for `@unpic/react/base` when the URL is not served by a known CDN. */
export const unpicPassthroughTransform: TransformerFunction<
    Record<string, never>,
    undefined
> = (src) => (typeof src === 'string' ? src : src.toString());
