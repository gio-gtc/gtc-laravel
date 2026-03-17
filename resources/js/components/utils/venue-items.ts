import type {
    LocalizedArtTableRow,
    MediaTableRow,
    StaticAssetsTableRow,
    VenueItemsLocalizedRow,
    VenueItemsMediaRow,
    VenueItemsStaticRow,
} from '@/types';

export function venueItemsMediaTableRow(
    row: VenueItemsMediaRow,
): MediaTableRow {
    const { label, ...rest } = row;
    return { ...rest, cutName: label };
}

export function venueItemsStaticTableRow(
    row: VenueItemsStaticRow,
): StaticAssetsTableRow {
    const { label, ...rest } = row;
    return { ...rest, cutName: label };
}

export function venueItemsLocalizedTableRow(
    row: VenueItemsLocalizedRow,
): LocalizedArtTableRow {
    const { label, ...rest } = row;
    return { ...rest, description: label };
}
