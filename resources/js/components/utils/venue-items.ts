import type {
    LocalizedArtTableRow,
    MediaTableRow,
    StaticAssetsTableRow,
    User,
    VenueItemAssigned,
    VenueItemStatus,
    VenueItemsArtRow,
    VenueItemsBroadcastRadioSocialRow,
    VenueItemsLocalizedRow,
    VenueItemsRow,
} from '@/types';

export type OrdersVenueLineCatalog = {
    venue_items: VenueItemsRow[];
    venue_item_assigned: VenueItemAssigned[];
    venue_item_status: VenueItemStatus[];
};

type VenueLineItemStatusLabel = MediaTableRow['status'];

export function venueItemStatusIdToLabel(
    statusId: number,
    venueItemStatus: VenueItemStatus[],
): VenueLineItemStatusLabel {
    const found = venueItemStatus.find((s) => s.id === statusId);
    return (found?.type ?? 'Still in Cart') as VenueLineItemStatusLabel;
}

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
    catalog: OrdersVenueLineCatalog,
): User[] {
    const { venue_items, venue_item_assigned } = catalog;
    const userByResolvedId = new Map(users.map((u) => [u.id, u] as const));
    const itemIds = new Set<string>();
    for (const row of venue_items) {
        if (!tourVenueIdMatchesRow(tourVenueId, row.tour_venue_id)) continue;
        itemIds.add(String(row.id));
    }
    const seenUserIds = new Set<number>();
    const result: User[] = [];
    for (const assign of venue_item_assigned) {
        if (!itemIds.has(String(assign.venue_item_id))) continue;
        if (seenUserIds.has(assign.mockUser_id)) continue;
        seenUserIds.add(assign.mockUser_id);
        const u = userByResolvedId.get(assign.mockUser_id);
        if (u) result.push(u);
    }
    return result;
}

export function getAssignedUsersForVenueItem(
    venueItemId: string | number,
    catalog: OrdersVenueLineCatalog,
    users: User[],
): User[] {
    const userById = new Map(users.map((u) => [u.id, u] as const));
    const id = String(venueItemId);
    return catalog.venue_item_assigned
        .filter((a) => String(a.venue_item_id) === id)
        .map((a) => userById.get(a.mockUser_id))
        .filter((u): u is User => u != null);
}

export function venueItemsMediaTableRow(
    row: VenueItemsBroadcastRadioSocialRow,
    assigned: User[],
    venueItemStatus: VenueItemStatus[],
): MediaTableRow {
    const {
        label,
        status_id,
        has_deliverable_actions: _h,
        deliverables: _d,
        tab: _tab,
        thumbnailUrl: _thumb,
        mediaUrl,
        kind,
        ...rest
    } = row;
    const previewImageUrl =
        kind === 'image'
            ? (mediaUrl ?? row.thumbnailUrl ?? null)
            : null;
    const previewVideoUrl =
        kind === 'image'
            ? null
            : (mediaUrl ?? row.previewVideoUrl ?? null);
    return {
        ...rest,
        cutName: label,
        assigned,
        status: venueItemStatusIdToLabel(status_id, venueItemStatus),
        previewVideoUrl,
        previewImageUrl,
    };
}

export function venueItemsArtTableRow(
    row: VenueItemsArtRow,
    assigned: User[],
    venueItemStatus: VenueItemStatus[],
): StaticAssetsTableRow {
    const {
        label,
        status_id,
        has_deliverable_actions: _h,
        deliverables: _d,
        tab: _tab,
        kind: _k,
        ...rest
    } = row;
    const previewImageUrl = row.mediaUrl ?? row.thumbnailUrl ?? null;
    return {
        ...rest,
        cutName: label,
        assigned,
        status: venueItemStatusIdToLabel(status_id, venueItemStatus),
        previewImageUrl,
    };
}

export function venueItemsLocalizedTableRow(
    row: VenueItemsLocalizedRow,
    assigned: User[],
): LocalizedArtTableRow {
    const { label, ...rest } = row;
    return { ...rest, description: label, assigned };
}
