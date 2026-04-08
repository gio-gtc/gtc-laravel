import { Button } from '@/components/ui/button';
import { buildVenueItemStatusSelectOptions } from '@/components/utils/editable-table/venue-item-status-options';
import {
    getAssignedUsersForVenueItem,
    venueItemStatusIdToLabel,
    venueItemsMediaTableRow,
    venueItemsStaticTableRow,
    type OrdersVenueLineCatalog,
} from '@/components/utils/venue-items';
import { useOrdersCatalog } from '@/contexts/orders-catalog-context';
import { useChat } from '@/hooks/use-chat';
import { useEditableTable } from '@/hooks/use-editable-table';
import { useUsersWithFallback } from '@/hooks/use-users-with-fallback';
import { plainTextToChatDoc } from '@/lib/chat-utils';
import {
    type Invoice,
    type MediaTableRow,
    type SharedData,
    type StaticAssetsTableRow,
    type Tour,
    type TourVenue,
    type User,
    type Venue,
    type VenueItemsMediaRow,
    type VenueItemsStaticRow,
} from '@/types';
import { usePage } from '@inertiajs/react';
import { format, isValid, parse, parseISO } from 'date-fns';
import { useCallback, useMemo, useState } from 'react';
import { ChatThread } from '../reuse/chat';
import BulkEditAssignedModal from '../reuse/modals/bulk-edit-assigned-modal';
import BulkEditDueDateModal from '../reuse/modals/bulk-edit-due-date-modal';
import EditIsciModal from '../reuse/modals/edit-isci-modal';
import SectionContainers from '../reuse/section-containers';
import MediaTable from '../reuse/tables/dynamic-media-table';
import AttachmentsSection from '../reuse/tables/sections/attachments-section-table';
import StaticAssetsMediaTable from '../reuse/tables/static-assets-media-table';
import BillingSection from './billing-section';
import Filters, {
    filterAndSortRows,
    type MediaStatusFilter,
    type SortDirection,
} from './filters';
import AddAudioModal from './modals/add-audio-modal';
import AddBroadcastStreamingModal from './modals/add-broadcast-streaming-modal';
import AddKeyArtStaticAssetsModal from './modals/add-key-art-static-assets-modal';
import AddSocialVideoModal from './modals/add-social-video-modal';
import RevisionRequestModal from './modals/revision-request-modal';
import VideoPlayerModal from './modals/video-player-modal';

interface GeneralMediaViewProps {
    order: Tour | null;
    venueItem: { orderVenue: TourVenue; venue: Venue | null } | null;
    selectedRowIds: ReadonlySet<string | number>;
    onRowSelectToggle: (rowId: string | number) => void;
    onOpenAttachModal?: (context?: {
        rowId: string | number;
        isci: string;
    }) => void;
}

function tableDueDateDisplayToIso(display: string): string | undefined {
    const trimmed = display.trim();
    if (!trimmed) return undefined;
    const d = parse(trimmed, 'M/d/yy', new Date());
    if (!isValid(d)) return undefined;
    return format(d, 'yyyy-MM-dd');
}

function GeneralMediaView({
    order,
    venueItem,
    selectedRowIds,
    onRowSelectToggle,
    onOpenAttachModal,
}: GeneralMediaViewProps) {
    const { auth } = usePage<SharedData>().props;
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

    const venueItemStatusSelectOptions = useMemo(
        () => buildVenueItemStatusSelectOptions(catalog.venue_item_status),
        [catalog.venue_item_status],
    );
    const chatChannelId = venueItem
        ? `tour-venue-${venueItem.orderVenue.id}`
        : 'general';
    const {
        messages: chatMessages,
        sendMessage: sendChatMessage,
        editMessage: editChatMessage,
        deleteMessage: deleteChatMessage,
    } = useChat(chatChannelId, auth.user.id);

    const [revisionModalOpen, setRevisionModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<MediaStatusFilter>([]);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);

    const venueMediaWithCallbacks = useMemo(() => {
        if (!venueItem) return [];
        return catalog.venue_items
            .filter(
                (r): r is VenueItemsMediaRow =>
                    r.type === 'media' &&
                    r.tour_venue_id === venueItem.orderVenue.id,
            )
            .map((row) => {
                const mediaRow = venueItemsMediaTableRow(
                    row,
                    getAssignedUsersForVenueItem(
                        row.id,
                        venueLineCatalog,
                        usersWithFallback,
                    ),
                    catalog.venue_item_status,
                );
                const resolvedStatus = venueItemStatusIdToLabel(
                    row.status_id,
                    catalog.venue_item_status,
                );
                const showDeliverables =
                    row.has_deliverable_actions ??
                    resolvedStatus === 'Client Review';
                return {
                    ...mediaRow,
                    deliverables: showDeliverables
                        ? {
                              onReject: () => {
                                  setRevisionModalOpen(true);
                              },
                          }
                        : undefined,
                };
            });
    }, [
        venueItem,
        catalog.venue_items,
        catalog.venue_item_status,
        venueLineCatalog,
        usersWithFallback,
    ]);

    const venueStaticAssetsWithCallbacks = useMemo(() => {
        if (!venueItem) return [];
        return catalog.venue_items
            .filter(
                (r): r is VenueItemsStaticRow =>
                    r.type === 'static' &&
                    r.tour_venue_id === venueItem.orderVenue.id,
            )
            .map((row) => {
                const staticRow = venueItemsStaticTableRow(
                    row,
                    getAssignedUsersForVenueItem(
                        row.id,
                        venueLineCatalog,
                        usersWithFallback,
                    ),
                    catalog.venue_item_status,
                );
                const resolvedStatus = venueItemStatusIdToLabel(
                    row.status_id,
                    catalog.venue_item_status,
                );
                const showDeliverables =
                    row.has_deliverable_actions ??
                    resolvedStatus === 'Client Review';
                return {
                    ...staticRow,
                    deliverables: showDeliverables
                        ? {
                              onReject: () => {
                                  setRevisionModalOpen(true);
                              },
                          }
                        : undefined,
                };
            });
    }, [
        venueItem,
        catalog.venue_items,
        catalog.venue_item_status,
        venueLineCatalog,
        usersWithFallback,
    ]);

    const {
        localData: localMediaRows,
        handleDoubleClick: handleMediaCellDoubleClick,
        handleCellChange: handleMediaCellChange,
        handleCellBlur: handleMediaCellBlur,
        handleCellKeyDown: handleMediaCellKeyDown,
        isEditing: isMediaCellEditing,
        bulkPatchByIds: bulkPatchMediaRows,
    } = useEditableTable<MediaTableRow>({
        data: venueMediaWithCallbacks,
        getId: (r) => r.id,
    });

    const {
        localData: localStaticRows,
        handleDoubleClick: handleStaticCellDoubleClick,
        handleCellChange: handleStaticCellChange,
        handleCellBlur: handleStaticCellBlur,
        handleCellKeyDown: handleStaticCellKeyDown,
        isEditing: isStaticCellEditing,
        bulkPatchByIds: bulkPatchStaticRows,
    } = useEditableTable<StaticAssetsTableRow>({
        data: venueStaticAssetsWithCallbacks,
        getId: (r) => r.id,
    });

    const [dueDateModalOpen, setDueDateModalOpen] = useState(false);
    const [assignedModalOpen, setAssignedModalOpen] = useState(false);
    const [dueDateSeedIso, setDueDateSeedIso] = useState<string | undefined>();
    const [assignedSeed, setAssignedSeed] = useState<User[]>([]);

    const [audioModalOpen, setAudioModalOpen] = useState(false);
    const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
    const [keyArtModalOpen, setKeyArtModalOpen] = useState(false);
    const [socialVideoModalOpen, setSocialVideoModalOpen] = useState(false);
    const [videoPlayerModalOpen, setVideoPlayerModalOpen] = useState(false);
    const [videoPreviewRow, setVideoPreviewRow] =
        useState<MediaTableRow | null>(null);
    const [editIsciRow, setEditIsciRow] = useState<MediaTableRow | null>(null);
    const [videoPreviewTableTitle, setVideoPreviewTableTitle] = useState('');
    const [audioPlaceholderMode, setAudioPlaceholderMode] = useState(false);

    const handleVideoSectionPreviewClick = useCallback(
        (row: MediaTableRow, iconIndex: number) => {
            if (iconIndex === 0) {
                setVideoPreviewRow(row);
                setAudioPlaceholderMode(false);
                setVideoPlayerModalOpen(true);
            }
        },
        [],
    );

    const handleAudioSectionPreviewClick = useCallback(
        (row: MediaTableRow, iconIndex: number) => {
            if (iconIndex === 0) {
                setVideoPreviewRow(row);
                setAudioPlaceholderMode(true);
                setVideoPlayerModalOpen(true);
            }
        },
        [],
    );

    const openBroadcastVideoPreview = useCallback(
        (row: MediaTableRow, iconIndex: number) => {
            setVideoPreviewTableTitle('Broadcast & Streaming Video');
            handleVideoSectionPreviewClick(row, iconIndex);
        },
        [handleVideoSectionPreviewClick],
    );

    const openSocialVideoPreview = useCallback(
        (row: MediaTableRow, iconIndex: number) => {
            setVideoPreviewTableTitle('Social Video');
            handleVideoSectionPreviewClick(row, iconIndex);
        },
        [handleVideoSectionPreviewClick],
    );

    const openAudioVideoPreview = useCallback(
        (row: MediaTableRow, iconIndex: number) => {
            setVideoPreviewTableTitle('Audio');
            handleAudioSectionPreviewClick(row, iconIndex);
        },
        [handleAudioSectionPreviewClick],
    );

    const billingInvoices = useMemo((): Invoice[] => {
        if (!order || !venueItem || venueItem.venue == null) return [];
        return catalog.invoices.filter(
            (inv) =>
                !inv.isDeleted &&
                inv.tour === order.name &&
                inv.venue_id === venueItem.venue!.id,
        );
    }, [order, venueItem, catalog.invoices]);

    const venueOrders = useMemo(() => {
        if (!venueItem) return [];
        return catalog.orders.filter(
            (o) => o.tour_venue_id === venueItem.orderVenue.id,
        );
    }, [venueItem, catalog.orders]);

    const orders = venueItem ? venueOrders : [];

    const isDemoRow = venueItem != null && venueItem.venue === null;

    const openDueDateBulkEdit = useCallback(
        (rowId: string | number) => {
            const mediaRow = localMediaRows.find((r) => r.id === rowId);
            const staticRow = localStaticRows.find((r) => r.id === rowId);
            const row = mediaRow ?? staticRow;
            if (!row) return;
            setDueDateSeedIso(tableDueDateDisplayToIso(row.dueDate));
            setDueDateModalOpen(true);
        },
        [localMediaRows, localStaticRows],
    );

    const openAssignedBulkEdit = useCallback(
        (rowId: string | number) => {
            const mediaRow = localMediaRows.find((r) => r.id === rowId);
            const staticRow = localStaticRows.find((r) => r.id === rowId);
            const row = mediaRow ?? staticRow;
            if (!row) return;
            setAssignedSeed([...row.assigned]);
            setAssignedModalOpen(true);
        },
        [localMediaRows, localStaticRows],
    );

    const handleDueDateBulkSave = useCallback(
        ({ dueDateIso }: { dueDateIso: string }) => {
            const dueDate = format(parseISO(dueDateIso), 'M/d/yy');
            bulkPatchMediaRows(selectedRowIds, { dueDate });
            bulkPatchStaticRows(selectedRowIds, { dueDate });
        },
        [bulkPatchMediaRows, bulkPatchStaticRows, selectedRowIds],
    );

    const handleAssignedBulkSave = useCallback(
        ({ assigned }: { assigned: User[] }) => {
            bulkPatchMediaRows(selectedRowIds, { assigned });
            bulkPatchStaticRows(selectedRowIds, { assigned });
        },
        [bulkPatchMediaRows, bulkPatchStaticRows, selectedRowIds],
    );

    const sharedMediaCellEditing = {
        onCellChange: handleMediaCellChange,
        onCellDoubleClick: handleMediaCellDoubleClick,
        onCellBlur: handleMediaCellBlur,
        onCellKeyDown: handleMediaCellKeyDown,
        isCellEditing: isMediaCellEditing,
    };

    const filteredMediaData = useMemo(
        () =>
            filterAndSortRows(
                localMediaRows,
                orders,
                statusFilter,
                sortDirection,
                catalog.orders,
            ),
        [localMediaRows, orders, statusFilter, sortDirection, catalog.orders],
    );

    const filteredStaticAssetsData = useMemo(
        () =>
            filterAndSortRows(
                localStaticRows,
                orders,
                statusFilter,
                sortDirection,
                catalog.orders,
            ),
        [localStaticRows, orders, statusFilter, sortDirection, catalog.orders],
    );

    return (
        <>
            {/* Media tables */}
            <div className="slide-out-container space-y-4">
                <Filters
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    sortDirection={sortDirection}
                    onSortDirectionChange={setSortDirection}
                    demoLinkHref={
                        isDemoRow
                            ? '/demo/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
                            : undefined
                    }
                />
                <MediaTable
                    title="Broadcast & Streaming Video"
                    data={filteredMediaData}
                    cellEditing={sharedMediaCellEditing}
                    editScope="broadcast"
                    venueItemStatusSelectOptions={venueItemStatusSelectOptions}
                    selectedRowIds={selectedRowIds}
                    onRowSelectToggle={onRowSelectToggle}
                    onBulkEditDueDateDoubleClick={openDueDateBulkEdit}
                    onBulkEditAssignedDoubleClick={openAssignedBulkEdit}
                    onAdd={() => setBroadcastModalOpen(true)}
                    onUploadRow={(row) =>
                        onOpenAttachModal?.({ rowId: row.id, isci: row.isci })
                    }
                    onEditIsciRow={(row) => setEditIsciRow(row)}
                    onPreviewClick={openBroadcastVideoPreview}
                />
                <MediaTable
                    title="Social Video"
                    data={filteredMediaData}
                    cellEditing={sharedMediaCellEditing}
                    editScope="social"
                    venueItemStatusSelectOptions={venueItemStatusSelectOptions}
                    selectedRowIds={selectedRowIds}
                    onRowSelectToggle={onRowSelectToggle}
                    onBulkEditDueDateDoubleClick={openDueDateBulkEdit}
                    onBulkEditAssignedDoubleClick={openAssignedBulkEdit}
                    onAdd={() => setSocialVideoModalOpen(true)}
                    onUploadRow={(row) =>
                        onOpenAttachModal?.({ rowId: row.id, isci: row.isci })
                    }
                    onEditIsciRow={(row) => setEditIsciRow(row)}
                    onPreviewClick={openSocialVideoPreview}
                />
                <MediaTable
                    title="Audio"
                    data={filteredMediaData}
                    cellEditing={sharedMediaCellEditing}
                    editScope="audio"
                    venueItemStatusSelectOptions={venueItemStatusSelectOptions}
                    selectedRowIds={selectedRowIds}
                    onRowSelectToggle={onRowSelectToggle}
                    onBulkEditDueDateDoubleClick={openDueDateBulkEdit}
                    onBulkEditAssignedDoubleClick={openAssignedBulkEdit}
                    onAdd={() => setAudioModalOpen(true)}
                    previewKind="audio"
                    onUploadRow={(row) =>
                        onOpenAttachModal?.({ rowId: row.id, isci: row.isci })
                    }
                    onEditIsciRow={(row) => setEditIsciRow(row)}
                    onPreviewClick={openAudioVideoPreview}
                />
                <StaticAssetsMediaTable
                    title="Key Art & Static Assets"
                    data={filteredStaticAssetsData}
                    venueItemStatusSelectOptions={venueItemStatusSelectOptions}
                    selectedRowIds={selectedRowIds}
                    onRowSelectToggle={onRowSelectToggle}
                    onBulkEditDueDateDoubleClick={openDueDateBulkEdit}
                    onBulkEditAssignedDoubleClick={openAssignedBulkEdit}
                    cellEditing={{
                        onCellChange: handleStaticCellChange,
                        onCellDoubleClick: handleStaticCellDoubleClick,
                        onCellBlur: handleStaticCellBlur,
                        onCellKeyDown: handleStaticCellKeyDown,
                        isCellEditing: isStaticCellEditing,
                    }}
                    onAdd={() => setKeyArtModalOpen(true)}
                />
            </div>

            {/* Submit Order Buttons */}
            <div className="flex justify-center gap-1 rounded-lg bg-neutral-100 p-1">
                <Button className="cursor-pointer bg-white text-gray-700 hover:bg-gray-200">
                    Cancel
                </Button>
                <Button className="cursor-pointer bg-brand-gtc-red hover:bg-brand-gtc-red/70">
                    Submit Order
                </Button>
            </div>

            {/* Billing Section */}
            <SectionContainers title="Billing Invoices">
                <BillingSection billingInvoices={billingInvoices} />
            </SectionContainers>

            {/* Attachments Section */}
            <SectionContainers title="Attachments">
                <AttachmentsSection />
            </SectionContainers>

            {/* Chat Section */}
            <SectionContainers title="Comments">
                <ChatThread
                    messages={chatMessages}
                    sendMessage={sendChatMessage}
                    editMessage={editChatMessage}
                    deleteMessage={deleteChatMessage}
                    currentUserId={auth.user.id}
                    users={usersWithFallback}
                />
            </SectionContainers>

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
            <EditIsciModal
                key={editIsciRow?.id ?? 'closed'}
                isOpen={editIsciRow !== null}
                onClose={() => setEditIsciRow(null)}
                initialIsci={editIsciRow?.isci ?? ''}
                onSave={({ isci }) => {
                    if (editIsciRow) {
                        bulkPatchMediaRows(new Set([editIsciRow.id]), {
                            isci,
                        });
                    }
                }}
            />
            <AddBroadcastStreamingModal
                isOpen={broadcastModalOpen}
                onClose={() => setBroadcastModalOpen(false)}
            />
            <AddSocialVideoModal
                isOpen={socialVideoModalOpen}
                onClose={() => setSocialVideoModalOpen(false)}
            />
            <AddAudioModal
                isOpen={audioModalOpen}
                onClose={() => setAudioModalOpen(false)}
            />
            <AddKeyArtStaticAssetsModal
                isOpen={keyArtModalOpen}
                onClose={() => setKeyArtModalOpen(false)}
                isUSOrder={
                    venueItem?.venue ? venueItem.venue.country_id === 1 : true
                }
            />
            <RevisionRequestModal
                isOpen={revisionModalOpen}
                onClose={() => {
                    setRevisionModalOpen(false);
                }}
                onSubmit={(revisionMessage) => {
                    const message = revisionMessage.trim();
                    console.log(message);
                }}
            />
            <VideoPlayerModal
                isOpen={videoPlayerModalOpen}
                onClose={() => {
                    setVideoPlayerModalOpen(false);
                    setVideoPreviewRow(null);
                    setVideoPreviewTableTitle('');
                    setAudioPlaceholderMode(false);
                }}
                videoSrc={videoPreviewRow?.previewVideoUrl ?? undefined}
                useAudioPlaceholder={audioPlaceholderMode}
                label={
                    videoPreviewRow
                        ? `${videoPreviewRow.isci} – ${videoPreviewRow.cutName}`
                        : undefined
                }
                clientReviewActions={
                    videoPreviewRow?.status === 'Client Review'
                }
                onClientReviewApprove={() => {
                    if (videoPreviewRow) {
                        console.log(`approve: ${videoPreviewRow.isci}`);
                    }
                }}
                onClientReviewReject={() => setRevisionModalOpen(true)}
                onClientReviewCommentSubmit={(text) => {
                    if (!videoPreviewRow) return;
                    sendChatMessage(plainTextToChatDoc(text), {
                        message_type: 'revision_request',
                        metadata: {
                            tableName: videoPreviewTableTitle,
                            isci: videoPreviewRow.isci,
                        },
                    });
                }}
            />
        </>
    );
}

export default GeneralMediaView;
