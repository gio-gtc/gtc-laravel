import type { SharedData, User } from '@/types';
import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';

/* Returns a merged list of users: shared (local) users first, then demoUsers from config */
export function useUsersWithFallback(): User[] {
    const { users: sharedUsers = [], demoUsers = [] } =
        usePage<SharedData>().props;

    return useMemo(() => {
        const byId = new Map<number, User>();
        (sharedUsers as User[]).forEach((u) => byId.set(u.id, u));
        (demoUsers as User[]).forEach((u) => {
            if (!byId.has(u.id)) byId.set(u.id, u);
        });
        return Array.from(byId.values());
    }, [sharedUsers, demoUsers]);
}
