import { type OrdersFilterState } from '@/hooks/use-orders-filters';
import { type User } from '@/types';
import { type GroupedOrderData } from '../orders-table-header-actions';

export type OrderGroupVenueItem = GroupedOrderData['venues'][number];

export function sortVenueStopsByCreatedDesc(
    items: OrderGroupVenueItem[],
): OrderGroupVenueItem[] {
    return [...items].sort((a, b) => {
        const aTime = new Date(a.orderVenue.created_at).getTime();
        const bTime = new Date(b.orderVenue.created_at).getTime();
        return bTime - aTime;
    });
}

/** Demo row + filter context, or null when the demo row should not render. */
export function getVisibleOrderDemoContext(
    group: GroupedOrderData,
    options: {
        hasVenueLevelFilter: boolean;
        hasClientFilter: boolean;
        hasCollaboratorFilter: boolean;
        filters: OrdersFilterState;
        authUserId: number;
        searchQuery: string;
        getClientUser: (clientId: number) => User | undefined;
        getTourVenueAssignees: (tourVenueId: number) => User[];
    },
): {
    demoItem: OrderGroupVenueItem;
    owner: User | undefined;
    assignees: User[];
} | null {
    if (options.hasVenueLevelFilter) return null;

    const demoItem = group.venues.find((v) => v.venue === null);
    if (!demoItem) return null;

    const owner = options.getClientUser(group.order.owner_contact_id);
    const demoMatchesClient =
        !options.hasClientFilter ||
        (options.filters.myClients
            ? owner?.id === options.authUserId
            : owner && options.filters.clientIds.includes(owner.id));

    const assignees = options.getTourVenueAssignees(demoItem.orderVenue.id);
    const demoMatchesCollaborator =
        !options.hasCollaboratorFilter ||
        (options.filters.myCollaborators
            ? assignees.some((c) => c.id === options.authUserId)
            : assignees.some((c) =>
                  options.filters.collaboratorIds.includes(c.id),
              ));

    const q = options.searchQuery.toLowerCase().trim();
    const searchMatchesDemo =
        !q ||
        'demo'.includes(q) ||
        (owner?.name?.toLowerCase().includes(q) ?? false) ||
        assignees.some((a) => a.name.toLowerCase().includes(q));

    if (!(demoMatchesClient && demoMatchesCollaborator && searchMatchesDemo)) {
        return null;
    }

    return { demoItem, owner, assignees };
}
