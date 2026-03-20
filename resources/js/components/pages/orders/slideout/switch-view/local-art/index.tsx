import { venueItemsData } from '@/components/mockdata';
import {
    getAssignedUsersForVenueItem,
    venueItemsLocalizedTableRow,
} from '@/components/utils/venue-items';
import {
    type LocalizedArtTableRow,
    type TourVenue,
    type Venue,
    type VenueItemsLocalizedRow,
} from '@/types';
import { useEditableTable } from '@/hooks/use-editable-table';
import { useMemo, useState } from 'react';
import AttachmentsSection from '../reuse/attachments-section';
import ChatBox from '../reuse/chat';
import LocalizedArtTable from '../reuse/localised-media-table';
import NotesModal from '../reuse/notes-modal';
import SectionContainers from '../reuse/section-containers';

interface LocalArtViewProps {
    venueItem: { orderVenue: TourVenue; venue: Venue | null } | null;
    selectedRowIds: ReadonlySet<string | number>;
    onRowSelectToggle: (rowId: string | number) => void;
}

function LocalArtView({
    venueItem,
    selectedRowIds,
    onRowSelectToggle,
}: LocalArtViewProps) {
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
            .map((row) =>
                venueItemsLocalizedTableRow(
                    row,
                    getAssignedUsersForVenueItem(row.id),
                ),
            );
    }, [venueItem]);

    const {
        localData: localLocalizedRows,
        handleDoubleClick: handleLocalizedCellDoubleClick,
        handleCellChange: handleLocalizedCellChange,
        handleCellBlur: handleLocalizedCellBlur,
        handleCellKeyDown: handleLocalizedCellKeyDown,
        isEditing: isLocalizedCellEditing,
    } = useEditableTable<LocalizedArtTableRow>({
        data: localizedArtData,
        getId: (r) => r.id,
    });

    return (
        <>
            <div className="slide-out-container space-y-4">
                <LocalizedArtTable
                    title="Localized Art"
                    data={localLocalizedRows}
                    selectedRowIds={selectedRowIds}
                    onRowSelectToggle={onRowSelectToggle}
                    onOpenNotes={(row) => setNotesModalRow(row)}
                    cellEditing={{
                        onCellChange: handleLocalizedCellChange,
                        onCellDoubleClick: handleLocalizedCellDoubleClick,
                        onCellBlur: handleLocalizedCellBlur,
                        onCellKeyDown: handleLocalizedCellKeyDown,
                        isCellEditing: isLocalizedCellEditing,
                    }}
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
