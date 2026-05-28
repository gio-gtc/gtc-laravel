import {
    filterClientUsers,
    filterCollaboratorUsers,
} from '@/lib/orders/orders-filter-users';
import { useUsersWithFallback } from '@/hooks/use-users-with-fallback';
import { useMemo } from 'react';

export function useOrdersFilterUsers() {
    const allUsers = useUsersWithFallback();

    const clientUsers = useMemo(
        () => filterClientUsers(allUsers),
        [allUsers],
    );

    const collaboratorUsers = useMemo(
        () => filterCollaboratorUsers(allUsers),
        [allUsers],
    );

    return {
        allUsers,
        clientUsers,
        collaboratorUsers,
    };
}
