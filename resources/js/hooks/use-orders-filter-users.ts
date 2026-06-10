import {
    clientWireToUser,
    fetchAllClients,
} from '@/lib/orders/client-search';
import {
    fetchStaffRoster,
    OrderItemApiError,
} from '@/lib/orders/order-item-api-client';
import type { User } from '@/types';
import { useCallback, useEffect, useState } from 'react';

let clientsCache: User[] | null = null;
let staffCache: User[] | null = null;
let staffFetchStarted = false;

export function useOrdersFilterUsers() {
    const [clientUsers, setClientUsers] = useState<User[]>(
        () => clientsCache ?? [],
    );
    const [collaboratorUsers, setCollaboratorUsers] = useState<User[]>(
        () => staffCache ?? [],
    );
    const [clientsLoading, setClientsLoading] = useState(clientsCache === null);
    const [staffLoading, setStaffLoading] = useState(false);
    const [clientsError, setClientsError] = useState<string | undefined>();
    const [staffError, setStaffError] = useState<string | undefined>();
    const [staffRosterLoaded, setStaffRosterLoaded] = useState(
        staffCache !== null,
    );

    useEffect(() => {
        if (clientsCache) {
            return;
        }

        const controller = new AbortController();
        setClientsLoading(true);
        setClientsError(undefined);

        void fetchAllClients(controller.signal)
            .then((rows) => {
                const users = rows.map(clientWireToUser);
                clientsCache = users;
                setClientUsers(users);
            })
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }
                setClientsError('Could not load clients.');
            })
            .finally(() => {
                setClientsLoading(false);
            });

        return () => controller.abort();
    }, []);

    const loadStaffRoster = useCallback(() => {
        if (staffCache) {
            setCollaboratorUsers(staffCache);
            setStaffRosterLoaded(true);
            return;
        }

        if (staffFetchStarted) {
            return;
        }

        staffFetchStarted = true;
        setStaffLoading(true);
        setStaffError(undefined);

        const controller = new AbortController();

        void fetchStaffRoster(controller.signal)
            .then((staff) => {
                staffCache = staff;
                setCollaboratorUsers(staff);
                setStaffRosterLoaded(true);
            })
            .catch((error: unknown) => {
                staffFetchStarted = false;
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }
                if (error instanceof OrderItemApiError) {
                    setStaffError(error.message);
                    return;
                }
                setStaffError('Could not load staff roster.');
            })
            .finally(() => {
                setStaffLoading(false);
            });
    }, []);

    return {
        clientUsers,
        collaboratorUsers,
        clientsLoading,
        staffLoading,
        clientsError,
        staffError,
        staffRosterLoaded,
        loadStaffRoster,
    };
}
