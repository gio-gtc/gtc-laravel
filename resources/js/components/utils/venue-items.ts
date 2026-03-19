import {
    mockUsers,
    venueItemAssigned,
    venueItemsData,
} from '@/components/mockdata';
import type {
    LocalizedArtTableRow,
    MediaTableRow,
    StaticAssetsTableRow,
    User,
    VenueItemsLocalizedRow,
    VenueItemsMediaRow,
    VenueItemsStaticRow,
} from '@/types';

const userById = new Map(mockUsers.map((u) => [u.id, u] as const));

function tourVenueIdMatchesRow(
    tourVenueId: number,
    rowTourVenueId: string | number,
): boolean {
    const n =
        typeof rowTourVenueId === 'number'
            ? rowTourVenueId
            : Number(rowTourVenueId);
    return !Number.isNaN(n) && tourVenueId === n;
}

/** Unique assignees across all venue line items for a tour venue (slideout / orders aggregate). */
export function getUniqueAssignedUsersForTourVenue(
    tourVenueId: number,
    users: User[],
): User[] {
    const userByResolvedId = new Map(users.map((u) => [u.id, u] as const));
    const itemIds = new Set<number>();
    for (const row of venueItemsData) {
        if (!tourVenueIdMatchesRow(tourVenueId, row.tour_venue_id)) continue;
        const rawId = row.id;
        const id =
            typeof rawId === 'number' ? rawId : Number(rawId);
        if (!Number.isNaN(id)) {
            itemIds.add(id);
        }
    }
    const seenUserIds = new Set<number>();
    const result: User[] = [];
    for (const assign of venueItemAssigned) {
        if (!itemIds.has(assign.venue_item_id)) continue;
        if (seenUserIds.has(assign.mockUser_id)) continue;
        seenUserIds.add(assign.mockUser_id);
        const u = userByResolvedId.get(assign.mockUser_id);
        if (u) result.push(u);
    }
    return result;
}

export function getAssignedUsersForVenueItem(
    venueItemId: string | number,
): User[] {
    const id =
        typeof venueItemId === 'number'
            ? venueItemId
            : Number(venueItemId);
    if (Number.isNaN(id)) {
        return [];
    }
    return venueItemAssigned
        .filter((a) => a.venue_item_id === id)
        .map((a) => userById.get(a.mockUser_id))
        .filter((u): u is User => u != null);
}

export function venueItemsMediaTableRow(
    row: VenueItemsMediaRow,
    assigned: User[],
): MediaTableRow {
    const { label, ...rest } = row;
    return { ...rest, cutName: label, assigned };
}

export function venueItemsStaticTableRow(
    row: VenueItemsStaticRow,
    assigned: User[],
): StaticAssetsTableRow {
    const { label, ...rest } = row;
    return { ...rest, cutName: label, assigned };
}

export function venueItemsLocalizedTableRow(
    row: VenueItemsLocalizedRow,
    assigned: User[],
): LocalizedArtTableRow {
    const { label, ...rest } = row;
    return { ...rest, description: label, assigned };
}
