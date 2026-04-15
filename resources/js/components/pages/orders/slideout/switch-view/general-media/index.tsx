import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { buildVenueItemStatusSelectOptions } from '@/components/utils/editable-table/venue-item-status-options';
import {
    getAssignedUsersForVenueItem,
    venueItemStatusIdToLabel,
    venueItemsArtTableRow,
    venueItemsMediaTableRow,
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
    type VenueItemsArtRow,
    type VenueItemsBroadcastRadioSocialRow,
    type VenueItemsBroadcastRow,
    type VenueItemsRadioRow,
    type VenueItemsSocialRow,
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
import { VENUE_ITEM_ART_PACKAGE_TYPES } from './modals/spot-type-cuts-options';
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
    const { replaceVenueItem } = catalog;
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
    const artPackageTypeSelectOptions = useMemo(
        () =>
            VENUE_ITEM_ART_PACKAGE_TYPES.map((value) => ({
                value,
                label: value,
            })),
        [],
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

    const mapBroadcastRadioSocialRow = useCallback(
        (row: VenueItemsBroadcastRadioSocialRow) => {
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
        },
        [
            catalog.venue_item_status,
            venueLineCatalog,
            usersWithFallback,
        ],
    );

    const venueBroadcastWithCallbacks = useMemo(() => {
        if (!venueItem) return [];
        return catalog.venue_items
            .filter(
                (r): r is VenueItemsBroadcastRadioSocialRow =>
                    r.type === 'broadcast' &&
                    r.tour_venue_id === venueItem.orderVenue.id,
            )
            .map(mapBroadcastRadioSocialRow);
    }, [venueItem, catalog.venue_items, mapBroadcastRadioSocialRow]);

    const venueSocialLineWithCallbacks = useMemo(() => {
        if (!venueItem) return [];
        return catalog.venue_items
            .filter(
                (r): r is VenueItemsBroadcastRadioSocialRow =>
                    r.type === 'social' &&
                    r.tour_venue_id === venueItem.orderVenue.id,
            )
            .map(mapBroadcastRadioSocialRow);
    }, [venueItem, catalog.venue_items, mapBroadcastRadioSocialRow]);

    const venueRadioWithCallbacks = useMemo(() => {
        if (!venueItem) return [];
        return catalog.venue_items
            .filter(
                (r): r is VenueItemsBroadcastRadioSocialRow =>
                    r.type === 'radio' &&
                    r.tour_venue_id === venueItem.orderVenue.id,
            )
            .map(mapBroadcastRadioSocialRow);
    }, [venueItem, catalog.venue_items, mapBroadcastRadioSocialRow]);

    const venueArtWithCallbacks = useMemo(() => {
        if (!venueItem) return [];
        return catalog.venue_items
            .filter(
                (r): r is VenueItemsArtRow =>
                    r.type === 'art' &&
                    r.tour_venue_id === venueItem.orderVenue.id,
            )
            .map((row) => {
                const staticRow = venueItemsArtTableRow(
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
        localData: localBroadcastRows,
        handleDoubleClick: handleBroadcastCellDoubleClick,
        handleCellChange: handleBroadcastCellChange,
        handleCellBlur: handleBroadcastCellBlur,
        handleCellKeyDown: handleBroadcastCellKeyDown,
        isEditing: isBroadcastCellEditing,
        bulkPatchByIds: bulkPatchBroadcastRows,
    } = useEditableTable<MediaTableRow>({
        data: venueBroadcastWithCallbacks,
        getId: (r) => r.id,
    });

    const {
        localData: localSocialLineRows,
        handleDoubleClick: handleSocialLineCellDoubleClick,
        handleCellChange: handleSocialLineCellChange,
        handleCellBlur: handleSocialLineCellBlur,
        handleCellKeyDown: handleSocialLineCellKeyDown,
        isEditing: isSocialLineCellEditing,
        bulkPatchByIds: bulkPatchSocialLineRows,
    } = useEditableTable<MediaTableRow>({
        data: venueSocialLineWithCallbacks,
        getId: (r) => r.id,
    });

    const {
        localData: localRadioRows,
        handleDoubleClick: handleRadioCellDoubleClick,
        handleCellChange: handleRadioCellChange,
        handleCellBlur: handleRadioCellBlur,
        handleCellKeyDown: handleRadioCellKeyDown,
        isEditing: isRadioCellEditing,
        bulkPatchByIds: bulkPatchRadioRows,
    } = useEditableTable<MediaTableRow>({
        data: venueRadioWithCallbacks,
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
        data: venueArtWithCallbacks,
        getId: (r) => r.id,
    });

    const [dueDateModalOpen, setDueDateModalOpen] = useState(false);
    const [assignedModalOpen, setAssignedModalOpen] = useState(false);
    const [dueDateSeedIso, setDueDateSeedIso] = useState<string | undefined>();
    const [assignedSeed, setAssignedSeed] = useState<User[]>([]);

    const [audioModalOpen, setAudioModalOpen] = useState(false);
    const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
    const [broadcastModalMode, setBroadcastModalMode] = useState<'add' | 'edit'>(
        'add',
    );
    const [broadcastEditRow, setBroadcastEditRow] =
        useState<VenueItemsBroadcastRow | null>(null);
    const [socialModalMode, setSocialModalMode] = useState<'add' | 'edit'>(
        'add',
    );
    const [socialEditRow, setSocialEditRow] =
        useState<VenueItemsSocialRow | null>(null);
    const [radioModalMode, setRadioModalMode] = useState<'add' | 'edit'>('add');
    const [radioEditRow, setRadioEditRow] = useState<VenueItemsRadioRow | null>(
        null,
    );
    const [keyArtModalOpen, setKeyArtModalOpen] = useState(false);
    const [socialVideoModalOpen, setSocialVideoModalOpen] = useState(false);
    const [videoPlayerModalOpen, setVideoPlayerModalOpen] = useState(false);
    const [videoPreviewRow, setVideoPreviewRow] =
        useState<MediaTableRow | null>(null);
    const [editIsciRow, setEditIsciRow] = useState<MediaTableRow | null>(null);
    const [videoPreviewTableTitle, setVideoPreviewTableTitle] = useState('');
    const [audioPlaceholderMode, setAudioPlaceholderMode] = useState(false);
    const [imagePreview, setImagePreview] = useState<{
        src: string;
        title: string;
    } | null>(null);

    const closeBroadcastModal = useCallback(() => {
        setBroadcastModalOpen(false);
        setBroadcastModalMode('add');
        setBroadcastEditRow(null);
    }, []);

    const closeSocialVideoModal = useCallback(() => {
        setSocialVideoModalOpen(false);
        setSocialModalMode('add');
        setSocialEditRow(null);
    }, []);

    const closeAudioModal = useCallback(() => {
        setAudioModalOpen(false);
        setRadioModalMode('add');
        setRadioEditRow(null);
    }, []);

    const handleBroadcastEditSave = useCallback(
        (row: VenueItemsBroadcastRow) => {
            replaceVenueItem(row);
            closeBroadcastModal();
        },
        [replaceVenueItem, closeBroadcastModal],
    );

    const handleSocialEditSave = useCallback(
        (row: VenueItemsSocialRow) => {
            replaceVenueItem(row);
            closeSocialVideoModal();
        },
        [replaceVenueItem, closeSocialVideoModal],
    );

    const handleRadioEditSave = useCallback(
        (row: VenueItemsRadioRow) => {
            replaceVenueItem(row);
            closeAudioModal();
        },
        [replaceVenueItem, closeAudioModal],
    );

    const handleVideoSectionPreviewClick = useCallback(
        (row: MediaTableRow, iconIndex: number) => {
            if (iconIndex === 0) {
                if (row.previewImageUrl) {
                    setImagePreview({
                        src: row.previewImageUrl,
                        title: `${row.isci} – ${row.cutName}`,
                    });
                    return;
                }
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
                if (row.previewImageUrl) {
                    setImagePreview({
                        src: row.previewImageUrl,
                        title: `${row.isci} – ${row.cutName}`,
                    });
                    return;
                }
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

    const openRadioVideoPreview = useCallback(
        (row: MediaTableRow, iconIndex: number) => {
            setVideoPreviewTableTitle('Radio');
            handleAudioSectionPreviewClick(row, iconIndex);
        },
        [handleAudioSectionPreviewClick],
    );

    const openStaticImagePreview = useCallback((row: StaticAssetsTableRow) => {
        if (!row.previewImageUrl) return;
        setImagePreview({
            src: row.previewImageUrl,
            title: row.cutName,
        });
    }, []);

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

    const orders = useMemo(
        () => (venueItem ? venueOrders : []),
        [venueItem, venueOrders],
    );

    const isDemoRow = venueItem != null && venueItem.venue === null;

    const demoLinkHref = useMemo(() => {
        if (!isDemoRow || !venueItem) return undefined;
        const u = venueItem.orderVenue.demo_uuid;
        return u ? `/demo/${u}` : undefined;
    }, [isDemoRow, venueItem]);

    const openDueDateBulkEdit = useCallback(
        (rowId: string | number) => {
            const broadcastRow = localBroadcastRows.find((r) => r.id === rowId);
            const socialLineRow = localSocialLineRows.find((r) => r.id === rowId);
            const radioRow = localRadioRows.find((r) => r.id === rowId);
            const staticRow = localStaticRows.find((r) => r.id === rowId);
            const row =
                broadcastRow ?? socialLineRow ?? radioRow ?? staticRow;
            if (!row) return;
            setDueDateSeedIso(tableDueDateDisplayToIso(row.dueDate));
            setDueDateModalOpen(true);
        },
        [
            localBroadcastRows,
            localSocialLineRows,
            localRadioRows,
            localStaticRows,
        ],
    );

    const openAssignedBulkEdit = useCallback(
        (rowId: string | number) => {
            const broadcastRow = localBroadcastRows.find((r) => r.id === rowId);
            const socialLineRow = localSocialLineRows.find((r) => r.id === rowId);
            const radioRow = localRadioRows.find((r) => r.id === rowId);
            const staticRow = localStaticRows.find((r) => r.id === rowId);
            const row =
                broadcastRow ?? socialLineRow ?? radioRow ?? staticRow;
            if (!row) return;
            setAssignedSeed([...row.assigned]);
            setAssignedModalOpen(true);
        },
        [
            localBroadcastRows,
            localSocialLineRows,
            localRadioRows,
            localStaticRows,
        ],
    );

    const handleDueDateBulkSave = useCallback(
        ({ dueDateIso }: { dueDateIso: string }) => {
            const dueDate = format(parseISO(dueDateIso), 'M/d/yy');
            bulkPatchBroadcastRows(selectedRowIds, { dueDate });
            bulkPatchSocialLineRows(selectedRowIds, { dueDate });
            bulkPatchRadioRows(selectedRowIds, { dueDate });
            bulkPatchStaticRows(selectedRowIds, { dueDate });
        },
        [
            bulkPatchBroadcastRows,
            bulkPatchSocialLineRows,
            bulkPatchRadioRows,
            bulkPatchStaticRows,
            selectedRowIds,
        ],
    );

    const handleAssignedBulkSave = useCallback(
        ({ assigned }: { assigned: User[] }) => {
            bulkPatchBroadcastRows(selectedRowIds, { assigned });
            bulkPatchSocialLineRows(selectedRowIds, { assigned });
            bulkPatchRadioRows(selectedRowIds, { assigned });
            bulkPatchStaticRows(selectedRowIds, { assigned });
        },
        [
            bulkPatchBroadcastRows,
            bulkPatchSocialLineRows,
            bulkPatchRadioRows,
            bulkPatchStaticRows,
            selectedRowIds,
        ],
    );

    const sharedBroadcastCellEditing = {
        onCellChange: handleBroadcastCellChange,
        onCellDoubleClick: handleBroadcastCellDoubleClick,
        onCellBlur: handleBroadcastCellBlur,
        onCellKeyDown: handleBroadcastCellKeyDown,
        isCellEditing: isBroadcastCellEditing,
    };

    const sharedSocialLineCellEditing = {
        onCellChange: handleSocialLineCellChange,
        onCellDoubleClick: handleSocialLineCellDoubleClick,
        onCellBlur: handleSocialLineCellBlur,
        onCellKeyDown: handleSocialLineCellKeyDown,
        isCellEditing: isSocialLineCellEditing,
    };

    const sharedRadioCellEditing = {
        onCellChange: handleRadioCellChange,
        onCellDoubleClick: handleRadioCellDoubleClick,
        onCellBlur: handleRadioCellBlur,
        onCellKeyDown: handleRadioCellKeyDown,
        isCellEditing: isRadioCellEditing,
    };

    const filteredBroadcastData = useMemo(
        () =>
            filterAndSortRows(
                localBroadcastRows,
                orders,
                statusFilter,
                sortDirection,
                catalog.orders,
            ),
        [
            localBroadcastRows,
            orders,
            statusFilter,
            sortDirection,
            catalog.orders,
        ],
    );

    const filteredSocialLineData = useMemo(
        () =>
            filterAndSortRows(
                localSocialLineRows,
                orders,
                statusFilter,
                sortDirection,
                catalog.orders,
            ),
        [
            localSocialLineRows,
            orders,
            statusFilter,
            sortDirection,
            catalog.orders,
        ],
    );

    const filteredRadioData = useMemo(
        () =>
            filterAndSortRows(
                localRadioRows,
                orders,
                statusFilter,
                sortDirection,
                catalog.orders,
            ),
        [localRadioRows, orders, statusFilter, sortDirection, catalog.orders],
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
                    demoLinkHref={demoLinkHref}
                />
                <MediaTable
                    title="Broadcast & Streaming Video"
                    data={filteredBroadcastData}
                    cellEditing={sharedBroadcastCellEditing}
                    editScope="broadcast"
                    venueItemStatusSelectOptions={venueItemStatusSelectOptions}
                    selectedRowIds={selectedRowIds}
                    onRowSelectToggle={onRowSelectToggle}
                    onBulkEditDueDateDoubleClick={openDueDateBulkEdit}
                    onBulkEditAssignedDoubleClick={openAssignedBulkEdit}
                    onAdd={() => {
                        setBroadcastModalMode('add');
                        setBroadcastEditRow(null);
                        setBroadcastModalOpen(true);
                    }}
                    onUploadRow={(row) =>
                        onOpenAttachModal?.({ rowId: row.id, isci: row.isci })
                    }
                    onEditIsciRow={(row) => setEditIsciRow(row)}
                    onEditLineInModal={(row) => {
                        const raw = catalog.venue_items.find(
                            (r): r is VenueItemsBroadcastRow =>
                                String(r.id) === String(row.id) &&
                                r.type === 'broadcast',
                        );
                        if (!raw) return;
                        setBroadcastModalMode('edit');
                        setBroadcastEditRow(raw);
                        setBroadcastModalOpen(true);
                    }}
                    onPreviewClick={openBroadcastVideoPreview}
                />
                <MediaTable
                    title="Social Video"
                    data={filteredSocialLineData}
                    cellEditing={sharedSocialLineCellEditing}
                    editScope="socialLine"
                    venueItemStatusSelectOptions={venueItemStatusSelectOptions}
                    selectedRowIds={selectedRowIds}
                    onRowSelectToggle={onRowSelectToggle}
                    onBulkEditDueDateDoubleClick={openDueDateBulkEdit}
                    onBulkEditAssignedDoubleClick={openAssignedBulkEdit}
                    onAdd={() => {
                        setSocialModalMode('add');
                        setSocialEditRow(null);
                        setSocialVideoModalOpen(true);
                    }}
                    onUploadRow={(row) =>
                        onOpenAttachModal?.({ rowId: row.id, isci: row.isci })
                    }
                    onEditIsciRow={(row) => setEditIsciRow(row)}
                    onEditLineInModal={(row) => {
                        const raw = catalog.venue_items.find(
                            (r): r is VenueItemsSocialRow =>
                                String(r.id) === String(row.id) &&
                                r.type === 'social',
                        );
                        if (!raw) return;
                        setSocialModalMode('edit');
                        setSocialEditRow(raw);
                        setSocialVideoModalOpen(true);
                    }}
                    onPreviewClick={openSocialVideoPreview}
                />
                <MediaTable
                    title="Radio"
                    data={filteredRadioData}
                    cellEditing={sharedRadioCellEditing}
                    editScope="radio"
                    venueItemStatusSelectOptions={venueItemStatusSelectOptions}
                    selectedRowIds={selectedRowIds}
                    onRowSelectToggle={onRowSelectToggle}
                    onBulkEditDueDateDoubleClick={openDueDateBulkEdit}
                    onBulkEditAssignedDoubleClick={openAssignedBulkEdit}
                    onAdd={() => {
                        setRadioModalMode('add');
                        setRadioEditRow(null);
                        setAudioModalOpen(true);
                    }}
                    previewKind="audio"
                    onUploadRow={(row) =>
                        onOpenAttachModal?.({ rowId: row.id, isci: row.isci })
                    }
                    onEditIsciRow={(row) => setEditIsciRow(row)}
                    onEditLineInModal={(row) => {
                        const raw = catalog.venue_items.find(
                            (r): r is VenueItemsRadioRow =>
                                String(r.id) === String(row.id) &&
                                r.type === 'radio',
                        );
                        if (!raw) return;
                        setRadioModalMode('edit');
                        setRadioEditRow(raw);
                        setAudioModalOpen(true);
                    }}
                    onPreviewClick={openRadioVideoPreview}
                />
                <StaticAssetsMediaTable
                    title="Key Art & Static Assets"
                    data={filteredStaticAssetsData}
                    venueItemStatusSelectOptions={venueItemStatusSelectOptions}
                    artPackageTypeSelectOptions={artPackageTypeSelectOptions}
                    selectedRowIds={selectedRowIds}
                    onRowSelectToggle={onRowSelectToggle}
                    onBulkEditDueDateDoubleClick={openDueDateBulkEdit}
                    onBulkEditAssignedDoubleClick={openAssignedBulkEdit}
                    onPreviewImageClick={openStaticImagePreview}
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
                        const idSet = new Set([editIsciRow.id]);
                        bulkPatchBroadcastRows(idSet, { isci });
                        bulkPatchSocialLineRows(idSet, { isci });
                        bulkPatchRadioRows(idSet, { isci });
                    }
                }}
            />
            <AddBroadcastStreamingModal
                key={
                    broadcastModalMode === 'edit' && broadcastEditRow
                        ? `broadcast-edit-${broadcastEditRow.id}`
                        : 'broadcast-add'
                }
                isOpen={broadcastModalOpen}
                onClose={closeBroadcastModal}
                mode={broadcastModalMode}
                initialVenueRow={broadcastEditRow ?? undefined}
                onEditSave={handleBroadcastEditSave}
                venue_item_language={catalog.venue_item_language}
                venue_item_encoding={catalog.venue_item_encoding}
            />
            <AddSocialVideoModal
                key={
                    socialModalMode === 'edit' && socialEditRow
                        ? `social-edit-${socialEditRow.id}`
                        : 'social-add'
                }
                isOpen={socialVideoModalOpen}
                onClose={closeSocialVideoModal}
                mode={socialModalMode}
                initialVenueRow={socialEditRow ?? undefined}
                onEditSave={handleSocialEditSave}
                venue_item_language={catalog.venue_item_language}
            />
            <AddAudioModal
                key={
                    radioModalMode === 'edit' && radioEditRow
                        ? `radio-edit-${radioEditRow.id}`
                        : 'radio-add'
                }
                isOpen={audioModalOpen}
                onClose={closeAudioModal}
                mode={radioModalMode}
                initialVenueRow={radioEditRow ?? undefined}
                onEditSave={handleRadioEditSave}
                venue_item_language={catalog.venue_item_language}
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
            <Dialog
                open={imagePreview !== null}
                onOpenChange={(open) => {
                    if (!open) setImagePreview(null);
                }}
            >
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{imagePreview?.title ?? 'Preview'}</DialogTitle>
                    </DialogHeader>
                    {imagePreview ? (
                        <img
                            src={imagePreview.src}
                            alt={imagePreview.title}
                            className="max-h-[70vh] w-full object-contain"
                        />
                    ) : null}
                </DialogContent>
            </Dialog>

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
