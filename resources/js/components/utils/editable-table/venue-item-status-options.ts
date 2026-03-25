import type { VenueItemStatus } from '@/types';

export function buildVenueItemStatusSelectOptions(
    venueItemStatus: VenueItemStatus[],
): { value: string; label: string }[] {
    return venueItemStatus.map((s) => ({ value: s.type, label: s.type }));
}
