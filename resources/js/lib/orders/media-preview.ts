export const MEDIA_PREVIEW_STATUSES = [
    'Client Review',
    'Out For Delivery',
] as const;

export type MediaPreviewStatus = (typeof MEDIA_PREVIEW_STATUSES)[number];

export function mediaTableRowAssetPath(row: {
    asset_path?: string | null;
}): string | null {
    const trimmed = row.asset_path?.trim();
    return trimmed ? trimmed : null;
}

export function canShowMediaPreview(
    status: string,
    assetPath: string | null | undefined,
): boolean {
    if (!assetPath?.trim()) {
        return false;
    }
    return MEDIA_PREVIEW_STATUSES.includes(status as MediaPreviewStatus);
}

/** Join public CDN base + relative asset_path → playable URL. */
export function resolveAssetPreviewUrl(
    assetPath: string | null | undefined,
    cdnBaseUrl: string | null | undefined,
): string | null {
    const path = assetPath?.trim();
    if (!path) {
        return null;
    }
    const base = cdnBaseUrl?.trim().replace(/\/+$/, '');
    if (!base) {
        return null;
    }
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
    return `${base}/${normalizedPath}`;
}
