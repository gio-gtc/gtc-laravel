import {
    getAssignedUsersForVenueItem,
    type OrdersVenueLineCatalog,
    venueItemsLocalizedTableRow,
} from '@/components/utils/venue-items';
import { useOrdersCatalog } from '@/contexts/orders-catalog-context';
import { useEditableTable } from '@/hooks/use-editable-table';
import { useUsersWithFallback } from '@/hooks/use-users-with-fallback';
import {
    type LocalizedArtTableRow,
    type TourVenue,
    type User,
    type Venue,
    type VenueItemsLocalizedRow,
} from '@/types';
import { format, isValid, parse, parseISO } from 'date-fns';
import { useCallback, useMemo, useState } from 'react';
import ChatBox from '../reuse/chat';
import BulkEditAssignedModal from '../reuse/modals/bulk-edit-assigned-modal';
import BulkEditDueDateModal from '../reuse/modals/bulk-edit-due-date-modal';
import NotesModal from '../reuse/modals/notes-modal';
import SectionContainers from '../reuse/section-containers';
import LocalizedArtTable from '../reuse/tables/localised-media-table';
import AttachmentsSection from '../reuse/tables/sections/attachments-section-table';

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
    const catalog = useOrdersCatalog();
    const usersWithFallback = useUsersWithFallback();

    const venueLineCatalog = useMemo((): OrdersVenueLineCatalog => {
        return {
            venue_items: catalog.venue_items,
            venue_item_assigned: catalog.venue_item_assigned,
            venue_item_status: catalog.venue_item_status,
        };
    }, [
        catalog.venue_items,
        catalog.venue_item_assigned,
        catalog.venue_item_status,
    ]);

    const [notesModalRow, setNotesModalRow] =
        useState<LocalizedArtTableRow | null>(null);

    const localizedArtData = useMemo(() => {
        if (!venueItem) return [];
        return catalog.venue_items
            .filter(
                (r): r is VenueItemsLocalizedRow =>
                    r.type === 'localized' &&
                    r.tour_venue_id === venueItem.orderVenue.id,
            )
            .map((row) =>
                venueItemsLocalizedTableRow(
                    row,
                    getAssignedUsersForVenueItem(
                        row.id,
                        venueLineCatalog,
                        usersWithFallback,
                    ),
                ),
            );
    }, [venueItem, catalog.venue_items, venueLineCatalog, usersWithFallback]);

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

    const [dueDateModalOpen, setDueDateModalOpen] = useState(false);
    const [assignedModalOpen, setAssignedModalOpen] = useState(false);
    const [dueDateSeedIso, setDueDateSeedIso] = useState<string | undefined>();
    const [assignedSeed, setAssignedSeed] = useState<User[]>([]);

    const openDueDateBulkEdit = useCallback(
        (rowId: string | number) => {
            const row = localLocalizedRows.find((r) => r.id === rowId);
            if (!row) return;
            setDueDateSeedIso(tableDueDateDisplayToIso(row.dueDate));
            setDueDateModalOpen(true);
        },
        [localLocalizedRows],
    );

    const openAssignedBulkEdit = useCallback(
        (rowId: string | number) => {
            const row = localLocalizedRows.find((r) => r.id === rowId);
            if (!row) return;
            setAssignedSeed([...row.assigned]);
            setAssignedModalOpen(true);
        },
        [localLocalizedRows],
    );

    const handleDueDateBulkSave = useCallback(
        ({ dueDateIso }: { dueDateIso: string }) => {
            const dueDate = format(parseISO(dueDateIso), 'M/d/yy');
            bulkPatchLocalizedRows(selectedRowIds, { dueDate });
        },
        [bulkPatchLocalizedRows, selectedRowIds],
    );

    const handleAssignedBulkSave = useCallback(
        ({ assigned }: { assigned: User[] }) => {
            bulkPatchLocalizedRows(selectedRowIds, { assigned });
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
                    onBulkEditDueDateDoubleClick={openDueDateBulkEdit}
                    onBulkEditAssignedDoubleClick={openAssignedBulkEdit}
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

            <BulkEditDueDateModal
                isOpen={dueDateModalOpen}
                onClose={() => setDueDateModalOpen(false)}
                initialDueDateIso={dueDateSeedIso}
                onSave={handleDueDateBulkSave}
            />
            <BulkEditAssignedModal
                isOpen={assignedModalOpen}
                onClose={() => setAssignedModalOpen(false)}
                initialAssigned={assignedSeed}
                onSave={handleAssignedBulkSave}
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
