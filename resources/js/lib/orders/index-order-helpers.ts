import {
    embedPersonToUser,
    externalClientEmbedToUser,
} from '@/lib/user-for-avatar';
import type { User } from '@/types';
import type {
    DashboardAssignee,
    IndexOrder,
    IndexOrderClient,
} from '@/types/orders-api';

export function flattenIndexOrderAssignees(
    order: IndexOrder,
): DashboardAssignee[] {
    return Array.from(
        new Map(
            order.order_items
                .flatMap((item) => item.assignees ?? [])
                .map((assignee) => [assignee.id, assignee]),
        ).values(),
    );
}

export function indexOrderAssigneesToUsers(
    order: IndexOrder,
    collaboratorRoster: User[],
): User[] {
    const flat = flattenIndexOrderAssignees(order);

    return flat.map((assignee) => {
        const fromRoster = collaboratorRoster.find((u) => u.id === assignee.id);
        if (fromRoster) {
            return fromRoster;
        }

        return embedPersonToUser({
            id: assignee.id,
            first_name: assignee.first_name,
            last_name: assignee.last_name,
            email: assignee.email,
            avatar: assignee.avatar,
        });
    });
}

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
