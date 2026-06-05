/**
 * Build CSRF-aware headers for JSON requests against Laravel's `web`
 * middleware. The `XSRF-TOKEN` cookie is set by Laravel automatically and is
 * reused by Inertia + the existing chat hooks.
 */
export function getCsrfHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    };

    const cookieToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

    if (cookieToken) {
        headers['X-XSRF-TOKEN'] = decodeURIComponent(cookieToken);
        return headers;
    }

    const metaToken = document.querySelector<HTMLMetaElement>(
        'meta[name="csrf-token"]',
    )?.content;

    if (metaToken) {
        headers['X-CSRF-TOKEN'] = metaToken;
    }

    return headers;
}
