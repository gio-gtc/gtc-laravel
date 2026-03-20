import { venueItemsData } from '@/components/mockdata';
import {
    getAssignedUsersForVenueItem,
    venueItemsLocalizedTableRow,
} from '@/components/utils/venue-items';
import {
    type LocalizedArtTableRow,
    type TourVenue,
    type User,
    type Venue,
    type VenueItemsLocalizedRow,
} from '@/types';
import { useEditableTable } from '@/hooks/use-editable-table';
import { format, isValid, parse, parseISO } from 'date-fns';
import { useCallback, useMemo, useState } from 'react';
import AttachmentsSection from '../reuse/attachments-section';
import BulkEditVenueRowsModal from '../reuse/bulk-edit-venue-rows-modal';
import ChatBox from '../reuse/chat';
import LocalizedArtTable from '../reuse/localised-media-table';
import NotesModal from '../reuse/notes-modal';
import SectionContainers from '../reuse/section-containers';

function tableDueDateDisplayToIso(display: string): string | undefined {
    const trimmed = display.trim();
    if (!trimmed) return undefined;
    const d = parse(trimmed, 'M/d/yy', new Date());
    if (!isValid(d)) return undefined;
    return format(d, 'yyyy-MM-dd');
}

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
        bulkPatchByIds: bulkPatchLocalizedRows,
    } = useEditableTable<LocalizedArtTableRow>({
        data: localizedArtData,
        getId: (r) => r.id,
    });

    const [bulkEditModalOpen, setBulkEditModalOpen] = useState(false);
    const [bulkEditSeed, setBulkEditSeed] = useState<{
        initialDueDateIso?: string;
        initialAssigned: User[];
    }>({ initialAssigned: [] });

    const openBulkEditForRow = useCallback(
        (rowId: string | number) => {
            const row = localLocalizedRows.find((r) => r.id === rowId);
            if (!row) return;
            setBulkEditSeed({
                initialDueDateIso: tableDueDateDisplayToIso(row.dueDate),
                initialAssigned: [...row.assigned],
            });
            setBulkEditModalOpen(true);
        },
        [localLocalizedRows],
    );

    const handleBulkEditSave = useCallback(
        ({
            dueDateIso,
            assigned,
        }: {
            dueDateIso: string;
            assigned: User[];
        }) => {
            const dueDate = format(parseISO(dueDateIso), 'M/d/yy');
            bulkPatchLocalizedRows(selectedRowIds, { dueDate, assigned });
        },
        [bulkPatchLocalizedRows, selectedRowIds],
    );

    return (
        <>
            <div className="slide-out-container space-y-4">
                <LocalizedArtTable
                    title="Localized Art"
                    data={localLocalizedRows}
                    selectedRowIds={selectedRowIds}
                    onRowSelectToggle={onRowSelectToggle}
                    onBulkEditTargetDoubleClick={openBulkEditForRow}
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

            <BulkEditVenueRowsModal
                isOpen={bulkEditModalOpen}
                onClose={() => setBulkEditModalOpen(false)}
                selectedCount={selectedRowIds.size}
                initialDueDateIso={bulkEditSeed.initialDueDateIso}
                initialAssigned={bulkEditSeed.initialAssigned}
                onSave={handleBulkEditSave}
            />
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
