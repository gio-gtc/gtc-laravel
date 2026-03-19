import { mockUsers, venueItemAssigned } from '@/components/mockdata';
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
