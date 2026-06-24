import { externalClientEmbedToUser } from '@/lib/user-for-avatar';
import type { User } from '@/types';
import type { IndexOrder, IndexOrderClient } from '@/types/orders-api';

export function resolveClientForIndexOrder(
    order: IndexOrder,
    clientRoster: User[],
): User | undefined {
    const client = order.client;
    if (!client) {
        return undefined;
    }

    const fromRoster = clientRoster.find((u) => u.id === client.id);
    if (fromRoster) {
        return fromRoster;
    }

    return indexOrderClientToUser(client);
}

function indexOrderClientToUser(client: IndexOrderClient): User {
    const org = client.organisation ?? { id: 0, name: '' };

    return externalClientEmbedToUser({
        id: client.id,
        first_name: client.first_name,
        last_name: client.last_name,
        email: '',
        organisation: { id: org.id, name: org.name },
    });
}

export function getVisibleIndexOrderDemoContext(
    orders: IndexOrder[],
    hasRegionalFilter: boolean,
): IndexOrder | null {
    if (hasRegionalFilter) {
        return null;
    }

    return orders.find((order) => order.is_demo) ?? null;
}
