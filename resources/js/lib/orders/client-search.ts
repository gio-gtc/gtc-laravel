import { getCsrfHeaders } from '@/lib/forms/csrf';
import { embedPersonToUser } from '@/lib/user-for-avatar';
import type { User } from '@/types';
import type {
    ClientWireUser,
    ClientsIndexResponse,
} from '@/types/orders-api';

export const MIN_CLIENT_SEARCH_LENGTH = 2;

export const CLIENT_SEARCH_DEBOUNCE_MS = 300;

export function clientDisplayLabel(client: ClientWireUser): string {
    const name = [client.first_name, client.last_name]
        .filter(Boolean)
        .join(' ')
        .trim();

    if (name !== '') {
        return name;
    }

    return client.email;
}

export function clientSecondaryLabel(client: ClientWireUser): string {
    const org = client.organisation?.name?.trim();
    const email = client.email?.trim();

    if (org && email) {
        return `${org} · ${email}`;
    }

    return org || email || '';
}

export function clientMatchesQuery(
    client: ClientWireUser,
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

export function clientWireToUser(row: ClientWireUser): User {
    const org = row.organisation ?? {
        id: row.organisation_id,
        name: '',
    };

    return embedPersonToUser(row, {
        id: org.id,
        name: org.name,
    });
}

function unwrapClientsPayload(body: ClientsIndexResponse): ClientWireUser[] {
    if (Array.isArray(body.clients)) {
        return body.clients;
    }

    const data = (body as { data?: unknown }).data;
    if (Array.isArray(data)) {
        return data as ClientWireUser[];
    }

    return [];
}

async function fetchClientsFromApi(
    params: URLSearchParams | undefined,
    signal?: AbortSignal,
): Promise<ClientWireUser[]> {
    const query = params?.toString();
    const url = query ? `/api/clients?${query}` : '/api/clients';

    const res = await fetch(url, {
        method: 'GET',
        headers: getCsrfHeaders(),
        credentials: 'same-origin',
        signal,
    });

    if (!res.ok) {
        return [];
    }

    const body = (await res.json()) as ClientsIndexResponse;

    return unwrapClientsPayload(body);
}

/** GET /api/clients — browse-all external client directory. */
export async function fetchAllClients(
    signal?: AbortSignal,
): Promise<ClientWireUser[]> {
    return fetchClientsFromApi(undefined, signal);
}

/** GET /api/clients?has_orders=true — clients with orders (advanced filters). */
export async function fetchFilterClients(
    signal?: AbortSignal,
): Promise<ClientWireUser[]> {
    const params = new URLSearchParams({ has_orders: 'true' });

    return fetchClientsFromApi(params, signal);
}

/**
 * GET /api/clients?q=… — type-ahead search.
 * Returns [] without a network request when q length < 2 (matches gtc-api guard).
 */
export async function fetchClients(
    search: string,
    signal: AbortSignal,
): Promise<ClientWireUser[]> {
    const trimmed = search.trim();
    if (trimmed.length < MIN_CLIENT_SEARCH_LENGTH) {
        return [];
    }

    const params = new URLSearchParams({ q: trimmed });

    return fetchClientsFromApi(params, signal);
}
