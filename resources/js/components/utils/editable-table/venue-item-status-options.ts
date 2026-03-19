import { venueItemStatus } from '@/components/mockdata';
import type { VenueItemStatusType } from '@/components/utils/venue-item-status-badge';

export const VENUE_ITEM_STATUS_SELECT_OPTIONS: {
    value: VenueItemStatusType;
    label: string;
}[] = venueItemStatus.map((s) => ({ value: s.type, label: s.type }));
