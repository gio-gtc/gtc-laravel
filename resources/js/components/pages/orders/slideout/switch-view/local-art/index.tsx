import {
    getAssignedUsersForVenueItem,
    getNotesForVenueItem,
    type OrdersVenueLineCatalog,
    venueItemsLocalizedTableRow,
} from '@/components/utils/venue-items';
import { useOrdersCatalog } from '@/contexts/orders-catalog-context';
import { resolveSlideoutCatalog } from '@/lib/orders/slideout-catalog-defaults';
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
import LocalizedArtFormModal from './modals/localized-art-form-modal';

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
    const slideout = resolveSlideoutCatalog(catalog);
    const usersWithFallback = useUsersWithFallback();

    const venueLineCatalog = useMemo((): OrdersVenueLineCatalog => {
        return {
            venue_items: slideout.venue_items,
            venue_item_assigned: slideout.venue_item_assigned,
            venue_item_notes: slideout.venue_item_notes,
            venue_item_status: slideout.venue_item_status,
        };
    }, [
        slideout.venue_items,
        slideout.venue_item_assigned,
        slideout.venue_item_notes,
        slideout.venue_item_status,
    ]);

    const [notesModalRow, setNotesModalRow] =
        useState<LocalizedArtTableRow | null>(null);

    const localizedArtData = useMemo(() => {
        if (!venueItem) return [];
        return slideout.venue_items
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
    }, [venueItem, slideout.venue_items, venueLineCatalog, usersWithFallback]);

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
    const [formModalOpen, setFormModalOpen] = useState(false);

    const resolvedOrderId = useMemo(() => {
        if (!venueItem) return null;
        const match = slideout._legacy_orders.find(
            (o) => o.tour_venue_id === venueItem.orderVenue.id,
        );
        return match?.id ?? null;
    }, [slideout._legacy_orders, venueItem]);

    /**
     * /venue-forms/{mock_venue_id} must match the catalog venue id in DB (see VenueSeeder).
     * `tour_venue_demos` rows intentionally have `venue: null` in the table so the slideout
     * stays in "Demo" display mode; we still need a mock venue id to load the form.
     */
    const formMockVenueId = useMemo(() => {
        if (!venueItem) {
            return null;
        }
        if (venueItem.venue != null) {
            return venueItem.venue.id;
        }
        const stopsForTour = slideout.tour_venue_stops
            .filter(
                (s) =>
                    s.tour_id === venueItem.orderVenue.tour_id &&
                    s.venue_id != null,
            )
            .sort((a, b) => a.id - b.id);
        const firstCatalogVenueId = stopsForTour[0]?.venue_id;
        if (firstCatalogVenueId != null) {
            return firstCatalogVenueId;
        }

        return slideout.venues[0]?.id ?? null;
    }, [venueItem, slideout.tour_venue_stops, slideout.venues]);

    const canOpenForm = formMockVenueId != null;

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
                    onAdd={canOpenForm ? () => setFormModalOpen(true) : undefined}
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
                notes={
                    notesModalRow
                        ? getNotesForVenueItem(
                              notesModalRow.id,
                              slideout.venue_item_notes,
                          )
                        : []
                }
                users={usersWithFallback}
            />

            <LocalizedArtFormModal
                isOpen={formModalOpen}
                onClose={() => setFormModalOpen(false)}
                mockVenueId={formMockVenueId}
                orderId={resolvedOrderId}
                tourVenueId={venueItem?.orderVenue.id ?? null}
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
