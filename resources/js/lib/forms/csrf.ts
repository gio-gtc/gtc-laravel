/**
 * Build CSRF-aware headers for JSON requests against Laravel's `web`
 * middleware. The `XSRF-TOKEN` cookie is set by Laravel automatically and is
 * reused by Inertia + the existing chat hooks.
 */
export function getCsrfHeaders(): Record<string, string> {
    const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    };
    if (token) headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
    return headers;
}
