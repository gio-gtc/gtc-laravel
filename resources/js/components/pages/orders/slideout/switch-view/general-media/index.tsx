import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { buildOrderItemStatusSelectOptions } from '@/components/utils/editable-table/venue-item-status-options';
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
import { resolveSlideoutCatalog } from '@/lib/orders/slideout-catalog-defaults';
import {
    OrderItemsArtRow,
    OrderItemsBroadcastRadioSocialRow,
    OrderItemsBroadcastRow,
    OrderItemsRadioRow,
    OrderItemsSocialRow,
    type Invoice,
    type MediaTableRow,
    type SharedData,
    type StaticAssetsTableRow,
    type Tour,
    type TourVenue,
    type User,
    type Venue,
} from '@/types';
import { usePage } from '@inertiajs/react';
import { format, isValid, parse, parseISO } from 'date-fns';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
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
import { VENUE_ITEM_ART_PACKAGE_TYPES } from './modals/spot-type-cuts-options';
import VideoPlayerModal from './modals/video-player-modal';

interface GeneralMediaViewProps {
    order: Tour | null;
    orderItem: { orderVenue: TourVenue; venue: Venue | null } | null;
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
    orderItem,
    selectedRowIds,
    onRowSelectToggle,
    onOpenAttachModal,
}: GeneralMediaViewProps) {
    const { auth } = usePage<SharedData>().props;
    const catalog = useOrdersCatalog();
    const slideout = resolveSlideoutCatalog(catalog);
    const apiSlideoutOrderId = catalog.slideoutApiOrderId;
    const { replaceVenueItem } = slideout;
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

    const orderItemStatusSelectOptions = useMemo(
        () => buildOrderItemStatusSelectOptions(slideout.venue_item_status),
        [slideout.venue_item_status],
    );
    const artPackageTypeSelectOptions = useMemo(
        () =>
            VENUE_ITEM_ART_PACKAGE_TYPES.map((value) => ({
                value,
                label: value,
            })),
        [],
    );
    const chatChannelId = orderItem
        ? `tour-venue-${orderItem.orderVenue.id}`
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
        (row: OrderItemsBroadcastRadioSocialRow) => {
            const mediaRow = venueItemsMediaTableRow(
                row,
                getAssignedUsersForVenueItem(
                    row.id,
                    venueLineCatalog,
                    usersWithFallback,
                ),
                slideout.venue_item_status,
            );
            const resolvedStatus = venueItemStatusIdToLabel(
                row.status_id,
                slideout.venue_item_status,
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
        [slideout.venue_item_status, venueLineCatalog, usersWithFallback],
    );

    const venueBroadcastWithCallbacks = useMemo(() => {
        if (!orderItem) return [];
        return slideout.venue_items
            .filter(
                (r): r is OrderItemsBroadcastRadioSocialRow =>
                    r.type === 'broadcast' &&
                    r.tour_venue_id === orderItem.orderVenue.id,
            )
            .map(mapBroadcastRadioSocialRow);
    }, [orderItem, slideout.venue_items, mapBroadcastRadioSocialRow]);

    const venueSocialLineWithCallbacks = useMemo(() => {
        if (!orderItem) return [];
        return slideout.venue_items
            .filter(
                (r): r is OrderItemsBroadcastRadioSocialRow =>
                    r.type === 'social' &&
                    r.tour_venue_id === orderItem.orderVenue.id,
            )
            .map(mapBroadcastRadioSocialRow);
    }, [orderItem, slideout.venue_items, mapBroadcastRadioSocialRow]);

    const venueRadioWithCallbacks = useMemo(() => {
        if (!orderItem) return [];
        return slideout.venue_items
            .filter(
                (r): r is OrderItemsBroadcastRadioSocialRow =>
                    r.type === 'radio' &&
                    r.tour_venue_id === orderItem.orderVenue.id,
            )
            .map(mapBroadcastRadioSocialRow);
    }, [orderItem, slideout.venue_items, mapBroadcastRadioSocialRow]);

    const venueArtWithCallbacks = useMemo(() => {
        if (!orderItem) return [];
        return slideout.venue_items
            .filter(
                (r): r is OrderItemsArtRow =>
                    r.type === 'art' &&
                    r.tour_venue_id === orderItem.orderVenue.id,
            )
            .map((row) => {
                const staticRow = venueItemsArtTableRow(
                    row,
                    getAssignedUsersForVenueItem(
                        row.id,
                        venueLineCatalog,
                        usersWithFallback,
                    ),
                    slideout.venue_item_status,
                );
                const resolvedStatus = venueItemStatusIdToLabel(
                    row.status_id,
                    slideout.venue_item_status,
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
        orderItem,
        slideout.venue_items,
        slideout.venue_item_status,
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
    const [broadcastModalMode, setBroadcastModalMode] = useState<
        'add' | 'edit'
    >('add');
    const [broadcastEditRow, setBroadcastEditRow] =
        useState<OrderItemsBroadcastRow | null>(null);
    const [socialModalMode, setSocialModalMode] = useState<'add' | 'edit'>(
        'add',
    );
    const [socialEditRow, setSocialEditRow] =
        useState<OrderItemsSocialRow | null>(null);
    const [radioModalMode, setRadioModalMode] = useState<'add' | 'edit'>('add');
    const [radioEditRow, setRadioEditRow] = useState<OrderItemsRadioRow | null>(
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
        (row: OrderItemsBroadcastRow) => {
            replaceVenueItem(row);
            closeBroadcastModal();
        },
        [replaceVenueItem, closeBroadcastModal],
    );

    const handleSocialEditSave = useCallback(
        (row: OrderItemsSocialRow) => {
            replaceVenueItem(row);
            closeSocialVideoModal();
        },
        [replaceVenueItem, closeSocialVideoModal],
    );

    const handleRadioEditSave = useCallback(
        (row: OrderItemsRadioRow) => {
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
        if (!order || !orderItem || orderItem.venue == null) return [];
        return slideout.invoices.filter(
            (inv) =>
                !inv.isDeleted &&
                inv.tour === order.name &&
                inv.venue_id === orderItem.venue!.id,
        );
    }, [order, orderItem, slideout.invoices]);

    const isDemoRow = orderItem != null && orderItem.venue === null;

    const demoLinkHref = useMemo(() => {
        if (!isDemoRow || !orderItem) return undefined;
        const u = orderItem.orderVenue.demo_uuid;
        return u ? `/demo/${u}` : undefined;
    }, [isDemoRow, orderItem]);

    const openDueDateBulkEdit = useCallback(
        (rowId: string | number) => {
            const broadcastRow = localBroadcastRows.find((r) => r.id === rowId);
            const socialLineRow = localSocialLineRows.find(
                (r) => r.id === rowId,
            );
            const radioRow = localRadioRows.find((r) => r.id === rowId);
            const staticRow = localStaticRows.find((r) => r.id === rowId);
            const row = broadcastRow ?? socialLineRow ?? radioRow ?? staticRow;
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
            const socialLineRow = localSocialLineRows.find(
                (r) => r.id === rowId,
            );
            const radioRow = localRadioRows.find((r) => r.id === rowId);
            const staticRow = localStaticRows.find((r) => r.id === rowId);
            const row = broadcastRow ?? socialLineRow ?? radioRow ?? staticRow;
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

    const notifyIfApiSlideoutReadOnly = useCallback(() => {
        if (apiSlideoutOrderId != null) {
            toast.info(
                'Inline edits are not saved to the API yet. Use add/edit modals for supported changes.',
            );
        }
    }, [apiSlideoutOrderId]);

    const handleDueDateBulkSave = useCallback(
        ({ dueDateIso }: { dueDateIso: string }) => {
            if (apiSlideoutOrderId != null) {
                notifyIfApiSlideoutReadOnly();
                return;
            }
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
            apiSlideoutOrderId,
            notifyIfApiSlideoutReadOnly,
        ],
    );

    const handleAssignedBulkSave = useCallback(
        ({ assigned }: { assigned: User[] }) => {
            if (apiSlideoutOrderId != null) {
                notifyIfApiSlideoutReadOnly();
                return;
            }
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
            apiSlideoutOrderId,
            notifyIfApiSlideoutReadOnly,
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
            filterAndSortRows(localBroadcastRows, statusFilter, sortDirection),
        [localBroadcastRows, statusFilter, sortDirection],
    );

    const filteredSocialLineData = useMemo(
        () =>
            filterAndSortRows(localSocialLineRows, statusFilter, sortDirection),
        [localSocialLineRows, statusFilter, sortDirection],
    );

    const filteredRadioData = useMemo(
        () => filterAndSortRows(localRadioRows, statusFilter, sortDirection),
        [localRadioRows, statusFilter, sortDirection],
    );

    const filteredStaticAssetsData = useMemo(
        () => filterAndSortRows(localStaticRows, statusFilter, sortDirection),
        [localStaticRows, statusFilter, sortDirection],
    );

    return (
        <>
            {/* Media tables */}
            <Filters
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                sortDirection={sortDirection}
                onSortDirectionChange={setSortDirection}
                demoLinkHref={demoLinkHref}
            />
            <div className="space-y-4 px-3 py-1">
                <MediaTable
                    title="Broadcast & Streaming Video"
                    data={filteredBroadcastData}
                    cellEditing={sharedBroadcastCellEditing}
                    editScope="broadcast"
                    orderItemStatusSelectOptions={orderItemStatusSelectOptions}
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
                        onOpenAttachModal?.({
                            rowId: row.id,
                            isci: row.isci,
                        })
                    }
                    onEditIsciRow={(row) => setEditIsciRow(row)}
                    onEditLineInModal={(row) => {
                        const raw = slideout.venue_items.find(
                            (r): r is OrderItemsBroadcastRow =>
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
                    orderItemStatusSelectOptions={orderItemStatusSelectOptions}
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
                        const raw = slideout.venue_items.find(
                            (r): r is OrderItemsSocialRow =>
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
                    orderItemStatusSelectOptions={orderItemStatusSelectOptions}
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
                        const raw = slideout.venue_items.find(
                            (r): r is OrderItemsRadioRow =>
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
                    orderItemStatusSelectOptions={orderItemStatusSelectOptions}
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
            <div className="flex justify-center gap-1 rounded-lg border bg-gray-50 px-1 py-0.5">
                <Button className="h-[36px]" variant="outline" size="md">
                    Cancel
                </Button>
                <Button className="h-[36px]" variant="destructive" size="md">
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
                venue_item_language={slideout.venue_item_language}
                venue_item_encoding={slideout.venue_item_encoding}
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
                venue_item_language={slideout.venue_item_language}
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
                venue_item_language={slideout.venue_item_language}
            />
            <AddKeyArtStaticAssetsModal
                isOpen={keyArtModalOpen}
                onClose={() => setKeyArtModalOpen(false)}
                isUSOrder={
                    orderItem?.venue ? orderItem.venue.country_id === 1 : true
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
                        <DialogTitle>
                            {imagePreview?.title ?? 'Preview'}
                        </DialogTitle>
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
