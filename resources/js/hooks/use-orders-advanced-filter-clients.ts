import {
    clientWireToUser,
    fetchFilterClients,
} from '@/lib/orders/client-search';
import type { User } from '@/types';
import { useCallback, useEffect, useState } from 'react';

let filterClientsCache: User[] | null = null;
let filterClientsFetchStarted = false;

export function useOrdersAdvancedFilterClients() {
    const [clientUsers, setClientUsers] = useState<User[]>(
        () => filterClientsCache ?? [],
    );
    const [clientsLoading, setClientsLoading] = useState(
        filterClientsCache === null,
    );
    const [clientsError, setClientsError] = useState<string | undefined>();

    const loadFilterClients = useCallback(() => {
        if (filterClientsCache) {
            setClientUsers(filterClientsCache);
            setClientsLoading(false);
            return;
        }

        if (filterClientsFetchStarted) {
            return;
        }

        filterClientsFetchStarted = true;
        setClientsLoading(true);
        setClientsError(undefined);

        const controller = new AbortController();

        void fetchFilterClients(controller.signal)
            .then((rows) => {
                const users = rows.map(clientWireToUser);
                filterClientsCache = users;
                setClientUsers(users);
            })
            .catch((error: unknown) => {
                filterClientsFetchStarted = false;
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }
                setClientsError('Could not load clients.');
            })
            .finally(() => {
                setClientsLoading(false);
            });
    }, []);

    useEffect(() => {
        loadFilterClients();
    }, [loadFilterClients]);

    return {
        clientUsers,
        clientsLoading,
        clientsError,
        loadFilterClients,
    };
}
