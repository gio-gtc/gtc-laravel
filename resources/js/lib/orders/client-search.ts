import { getCsrfHeaders } from '@/lib/forms/csrf';
import type {
    ClientSearchOption,
    ClientsSearchResponse,
} from '@/types/orders-api';

export const MIN_CLIENT_SEARCH_LENGTH = 2;

export const CLIENT_SEARCH_DEBOUNCE_MS = 300;

export function clientDisplayLabel(client: ClientSearchOption): string {
    const name = [client.first_name, client.last_name]
        .filter(Boolean)
        .join(' ')
        .trim();

    if (name !== '') {
        return name;
    }

    return client.email;
}

export function clientSecondaryLabel(client: ClientSearchOption): string {
    const org = client.organisation?.name?.trim();
    const email = client.email?.trim();

    if (org && email) {
        return `${org} · ${email}`;
    }

    return org || email || '';
}

export function clientMatchesQuery(
    client: ClientSearchOption,
    query: string,
): boolean {
    const q = query.trim().toLowerCase();
    if (!q) {
        return true;
    }

    const fields = [
        client.first_name,
        client.last_name,
        client.email,
        client.organisation?.name,
    ].map((s) => (s ?? '').toLowerCase());

    return fields.some((field) => field.includes(q));
}

function unwrapClientsPayload(body: ClientsSearchResponse): ClientSearchOption[] {
    if (Array.isArray(body.clients)) {
        return body.clients;
    }

    const data = (body as { data?: unknown }).data;
    if (Array.isArray(data)) {
        return data as ClientSearchOption[];
    }

    return [];
}

/**
 * GET /api/search/clients — no request when search length < 2 (matches gtc-api guard).
 */
export async function fetchClients(
    search: string,
    signal: AbortSignal,
): Promise<ClientSearchOption[]> {
    const trimmed = search.trim();
    if (trimmed.length < MIN_CLIENT_SEARCH_LENGTH) {
        return [];
    }

    const params = new URLSearchParams({ search: trimmed });
    const res = await fetch(`/api/search/clients?${params}`, {
        method: 'GET',
        headers: getCsrfHeaders(),
        credentials: 'same-origin',
        signal,
    });

    if (!res.ok) {
        return [];
    }

    const body = (await res.json()) as ClientsSearchResponse;

    return unwrapClientsPayload(body);
}
