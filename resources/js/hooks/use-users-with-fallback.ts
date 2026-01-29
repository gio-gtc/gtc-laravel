import { mockUsers } from '@/components/mockdata';
import type { SharedData, User } from '@/types';
import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';

/* Returns a merged list of users: shared (local) users first, then mockUsers */
export function useUsersWithFallback(): User[] {
    const { users: sharedUsers = [] } = usePage<SharedData>().props;

    return useMemo(() => {
        const byId = new Map<number, User>();
        (sharedUsers as User[]).forEach((u) => byId.set(u.id, u));
        mockUsers.forEach((u) => {
            if (!byId.has(u.id)) byId.set(u.id, u);
        });
        return Array.from(byId.values());
    }, [sharedUsers]);
}
