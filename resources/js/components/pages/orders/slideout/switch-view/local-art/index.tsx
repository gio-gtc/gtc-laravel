import { venueItemsData } from '@/components/mockdata';
import { venueItemsLocalizedTableRow } from '@/components/utils/venue-items';
import {
    type LocalizedArtTableRow,
    type TourVenue,
    type Venue,
    type VenueItemsLocalizedRow,
} from '@/types';
import { useMemo, useState } from 'react';
import AttachmentsSection from '../reuse/attachments-section';
import ChatBox from '../reuse/chat';
import LocalizedArtTable from '../reuse/localised-media-table';
import NotesModal from '../reuse/notes-modal';
import SectionContainers from '../reuse/section-containers';

interface LocalArtViewProps {
    venueItem: { orderVenue: TourVenue; venue: Venue | null } | null;
}

function LocalArtView({ venueItem }: LocalArtViewProps) {
    const [notesModalRow, setNotesModalRow] =
        useState<LocalizedArtTableRow | null>(null);

    const localizedArtData = useMemo(() => {
        if (!venueItem) return [];
        return venueItemsData
            .filter(
                (r): r is VenueItemsLocalizedRow =>
                    r.type === 'localized' &&
                    r.tour_venue_id === venueItem.orderVenue.id,
            )
            .map(venueItemsLocalizedTableRow);
    }, [venueItem]);

    return (
        <>
            <div className="slide-out-container space-y-4">
                <LocalizedArtTable
                    title="Localized Art"
                    data={localizedArtData}
                    onOpenNotes={(row) => setNotesModalRow(row)}
                />
            </div>

            <NotesModal
                isOpen={notesModalRow !== null}
                onClose={() => setNotesModalRow(null)}
                notes={notesModalRow?.notes ?? []}
            />

            {/* Attachments Section */}
            <SectionContainers title="Attachments">
                <AttachmentsSection />
            </SectionContainers>

            {/* Chat Section */}
            <SectionContainers title="Comments">
                <ChatBox />
            </SectionContainers>
        </>
    );
}

export default LocalArtView;
