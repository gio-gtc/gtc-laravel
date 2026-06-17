function isBffApiRequest(url: string): boolean {
    try {
        const parsed = new URL(url, window.location.origin);
        return parsed.origin === window.location.origin && parsed.pathname.startsWith('/api/');
    } catch {
        return url.startsWith('/api/');
    }
}

/** Redirect to login when a same-origin BFF /api/* call returns 401. */
export function installBffAuthFetchGuard(): void {
    const originalFetch = window.fetch.bind(window);

    window.fetch = async (
        input: RequestInfo | URL,
        init?: RequestInit,
    ): Promise<Response> => {
        const response = await originalFetch(input, init);

        if (response.status !== 401) {
            return response;
        }

        const url =
            typeof input === 'string'
                ? input
                : input instanceof URL
                  ? input.href
                  : input.url;

        if (!isBffApiRequest(url)) {
            return response;
        }

        window.location.assign('/login?session_expired=1');

        return response;
    };
}
