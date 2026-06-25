import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { LoadingDots } from '@/components/ui/loading-dots';
import { buildOrderItemStatusSelectOptions } from '@/components/utils/editable-table/venue-item-status-options';
import {
    getAssignedUsersForVenueItem,
    venueItemMediaLineLabel,
    venueItemsArtTableRow,
    venueItemsMediaTableRow,
    venueItemStatusIdToLabel,
    venueItemStatusLabelToId,
    type OrdersVenueLineCatalog,
} from '@/components/utils/venue-items';
import { useOrderSlideoutCatalog } from '@/contexts/order-slideout-catalog-context';
import { useOrdersCatalog } from '@/contexts/orders-catalog-context';
import { useChat } from '@/hooks/use-chat';
import { useEditableTable } from '@/hooks/use-editable-table';
import { useUsersWithFallback } from '@/hooks/use-users-with-fallback';
import { plainTextToChatDoc } from '@/lib/chat-utils';
import { tableDueDateDisplayToIso } from '@/lib/format/date';
import { parseDurationWireAsSeconds } from '@/lib/orders/broadcast-spec-wire';
import {
    isInlineDurationUnchanged,
    isInlineStatusUnchanged,
    rowAssigneesUnchanged,
} from '@/lib/orders/inline-edit-noop';
import {
    canShowMediaPreview,
    MEDIA_PREVIEW_STATUSES,
    mediaTableRowAssetPath,
    resolveAssetPreviewUrl,
    type MediaPreviewStatus,
} from '@/lib/orders/media-preview';
import {
    artCreateAdapter,
    artUpdateAdapter,
    broadcastCreateAdapter,
    broadcastUpdateAdapter,
    radioCreateAdapter,
    radioUpdateAdapter,
    socialCreateAdapter,
    socialUpdateAdapter,
    validateRadioRowSpecifications,
} from '@/lib/orders/order-item-adapters';
import { validateSocialRowSpecifications } from '@/lib/orders/order-item-adapters/social';
import type { OrderItemUpdateAdapter } from '@/lib/orders/order-item-adapters/types';
import {
    OrderItemApiError,
    reviseOrderItem,
    syncOrderItemAssignees,
} from '@/lib/orders/order-item-api-client';
import {
    orderCartBillingLines,
    orderCartBillingTotal,
    orderHasStillInCartItems,
} from '@/lib/orders/order-item-specifications';
import { ORDER_ITEM_STATUS_ID } from '@/lib/orders/order-item-statuses';
import {
    apiOrderItemTableStatus,
    isMediaTableRowStillInCart,
} from '@/lib/orders/order-item-table-rows';
import {
    assertBulkSelectionWritable,
    canApproveOrderItemDeliverable,
    canEditOrderLineItem,
    canEditOrderLineItemStatus,
    canInitiateOrderItemRevision,
    canStaffOverrideInactiveRowEdits,
    isOrderLineItemEditDisabled,
} from '@/lib/orders/order-line-item-write-access';
import { ORDER_MENU_CATEGORY_QUADRANTS } from '@/lib/orders/order-menu-categories';
import {
    OrderCartClearApiError,
    OrderSubmitApiError,
} from '@/lib/orders/orders-api-client';
import { orderItemAssigneesToUsers } from '@/lib/orders/orders-filter-users';
import { resolveSlideoutCatalog } from '@/lib/orders/slideout-catalog-defaults';
import { isGtcStaffUser } from '@/lib/user-organisation';
import {
    OrderItemsArtRow,
    OrderItemsBroadcastRadioSocialRow,
    OrderItemsBroadcastRow,
    OrderItemsRadioRow,
    OrderItemsSocialRow,
    type MediaTableRow,
    type SharedData,
    type StaticAssetsTableRow,
    type Tour,
    type TourVenue,
    type User,
    type Venue,
} from '@/types';
import { usePage } from '@inertiajs/react';
import { useCallback, useMemo, useRef, useState, type RefObject } from 'react';
import { toast } from 'react-toastify';
import { ChatThread } from '../reuse/chat';
import BulkEditAssignedModal from '../reuse/modals/bulk-edit-assigned-modal';
import BulkEditDueDateModal from '../reuse/modals/bulk-edit-due-date-modal';
import EditIsciModal from '../reuse/modals/edit-isci-modal';
import SectionContainers from '../reuse/section-containers';
import MediaTable from '../reuse/tables/dynamic-media-table';
import AttachmentsSection from '../reuse/tables/sections/attachments-section-table';
import StaticAssetsMediaTable from '../reuse/tables/static-assets-media-table';
import CartBillingTable from './cart-billing-table';
import Filters, {
    filterAndSortRows,
    type MediaStatusFilter,
    type SortDirection,
} from './filters';
import InvoiceBillingTable from './invoice-billing-table';
import AddAudioModal, {
    type AddAudioFormValues,
} from './modals/add-audio-modal';
import AddBroadcastStreamingModal, {
    type AddBroadcastStreamingFormValues,
} from './modals/add-broadcast-streaming-modal';
import type { AddKeyArtStaticAssetsFormValues } from './modals/add-key-art-static-assets-modal';
import AddKeyArtStaticAssetsModal from './modals/add-key-art-static-assets-modal';
import AddSocialVideoModal, {
    type AddSocialVideoFormValues,
} from './modals/add-social-video-modal';
import ClearCartConfirmModal from './modals/clear-cart-confirm-modal';
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

function mediaLinePatchAdapterForScope(
    tableScope: 'broadcast' | 'socialLine' | 'radio',
): Pick<
    OrderItemUpdateAdapter<OrderItemsBroadcastRow>,
    'typePatch' | 'cutPatch' | 'durationPatch' | 'statusPatch'
> {
    switch (tableScope) {
        case 'broadcast':
            return broadcastUpdateAdapter;
        case 'socialLine':
            return socialUpdateAdapter;
        case 'radio':
            return radioUpdateAdapter;
    }
}

function mediaLineUpdateAdapterForScope(
    tableScope: 'broadcast' | 'socialLine' | 'radio',
): Pick<
    OrderItemUpdateAdapter<OrderItemsBroadcastRow>,
    'typePatch' | 'cutPatch'
> {
    return mediaLinePatchAdapterForScope(tableScope);
}

function createMediaLineCellChangeHandler(
    handleCellChange: (
        itemId: number | string,
        field: string,
        value: string | number,
    ) => void,
    patchRowFields: (
        itemId: number | string,
        patch: Partial<MediaTableRow>,
    ) => void,
    dataRef: RefObject<MediaTableRow[]>,
) {
    return (itemId: number | string, field: string, value: string | number) => {
        if (field === 'spot_type' || field === 'cut') {
            const row = dataRef.current.find(
                (r) => String(r.id) === String(itemId),
            );
            if (!row) {
                return;
            }
            const spot_type =
                field === 'spot_type' ? String(value) : (row.spot_type ?? '');
            const cut = field === 'cut' ? String(value) : (row.cut ?? '');
            patchRowFields(itemId, {
                spot_type,
                cut,
                cutName: venueItemMediaLineLabel(spot_type, cut),
            });
            return;
        }
        handleCellChange(itemId, field, value);
    };
}

function parseArtDimensionInput(value: string | number): number | null {
    if (value === '' || value === null || value === undefined) {
        return null;
    }
    const parsed =
        typeof value === 'number'
            ? value
            : Number.parseInt(String(value).trim(), 10);
    return Number.isFinite(parsed) ? parsed : null;
}

function createArtCellChangeHandler(
    handleCellChange: (
        itemId: number | string,
        field: string,
        value: string | number,
    ) => void,
    patchRowFields: (
        itemId: number | string,
        patch: Partial<StaticAssetsTableRow>,
    ) => void,
) {
    return (itemId: number | string, field: string, value: string | number) => {
        if (field === 'cutName') {
            patchRowFields(itemId, {
                cutName: String(value),
            });
            return;
        }
        handleCellChange(itemId, field, value);
    };
}

function createMediaLineCellKeyDownHandler(
    handleCellKeyDown: (
        e: React.KeyboardEvent<HTMLElement>,
        itemId: number | string,
        field: string,
        scope?: string,
    ) => void,
    patchRowFields: (
        itemId: number | string,
        patch: Partial<MediaTableRow>,
    ) => void,
    dataRef: RefObject<MediaTableRow[]>,
) {
    return (
        e: React.KeyboardEvent<HTMLElement>,
        itemId: number | string,
        field: string,
        scope?: string,
    ) => {
        handleCellKeyDown(e, itemId, field, scope);
        if (e.key === 'Escape' && (field === 'spot_type' || field === 'cut')) {
            queueMicrotask(() => {
                const row = dataRef.current.find(
                    (r) => String(r.id) === String(itemId),
                );
                if (!row) {
                    return;
                }
                patchRowFields(itemId, {
                    cutName: venueItemMediaLineLabel(
                        row.spot_type ?? '',
                        row.cut ?? '',
                    ),
                });
            });
        }
    };
}

function applyOptimisticMediaLineBulkPatch(
    bulkTargetIds: number[],
    field: 'spot_type' | 'cut',
    value: string,
    dataRef: RefObject<MediaTableRow[]>,
    patchRowFields: (
        itemId: number | string,
        patch: Partial<MediaTableRow>,
    ) => void,
) {
    const idSet = new Set(bulkTargetIds.map((id) => String(id)));
    for (const row of dataRef.current) {
        if (!idSet.has(String(row.id))) {
            continue;
        }
        const spot_type = field === 'spot_type' ? value : (row.spot_type ?? '');
        const cut = field === 'cut' ? value : (row.cut ?? '');
        patchRowFields(row.id, {
            spot_type,
            cut,
            cutName: venueItemMediaLineLabel(spot_type, cut),
        });
    }
}

function applyOptimisticDurationBulkPatch(
    bulkTargetIds: number[],
    durationWire: string,
    dataRef: RefObject<MediaTableRow[]>,
    patchRowFields: (
        itemId: number | string,
        patch: Partial<MediaTableRow>,
    ) => void,
) {
    const parsedSeconds =
        parseDurationWireAsSeconds(durationWire) ??
        (Number.parseInt(durationWire, 10) || 0);
    const idSet = new Set(bulkTargetIds.map((id) => String(id)));
    for (const row of dataRef.current) {
        if (!idSet.has(String(row.id))) {
            continue;
        }
        patchRowFields(row.id, {
            duration_wire: durationWire,
            duration_seconds: parsedSeconds,
        });
    }
}

type RevisionTargetRow = MediaTableRow | StaticAssetsTableRow;

type DeliverableStatus = MediaPreviewStatus;

function rowShowsDeliverables(
    hasDeliverableActions: boolean | undefined,
    resolvedStatus: string,
): boolean {
    return (
        hasDeliverableActions ??
        MEDIA_PREVIEW_STATUSES.includes(resolvedStatus as DeliverableStatus)
    );
}

function buildDeliverableCallbacks(
    resolvedStatus: string,
    openRevision: (row: RevisionTargetRow, tableName: string) => void,
    onApprove: ((row: RevisionTargetRow) => void) | undefined,
    row: RevisionTargetRow,
    tableName: string,
    downloadVariant: 'broadcast' | 'simple',
): MediaTableRow['deliverables'] | undefined {
    if (
        resolvedStatus === 'Client Review' ||
        resolvedStatus === 'Out For Delivery'
    ) {
        const isci =
            'isci' in row && typeof row.isci === 'string' ? row.isci : '';

        return {
            onRevise: () => openRevision(row, tableName),
            ...(resolvedStatus === 'Client Review' && onApprove
                ? { onApprove: () => onApprove(row) }
                : {}),
            ...(resolvedStatus === 'Out For Delivery'
                ? {
                      downloadVariant,
                      onDownload:
                          downloadVariant === 'broadcast'
                              ? (optionId: string) => {
                                    console.log(optionId, isci);
                                }
                              : (_optionId: string) => {
                                    console.log(isci);
                                },
                  }
                : {}),
        };
    }
    return undefined;
}

function GeneralMediaView({
    order,
    orderItem,
    selectedRowIds,
    onRowSelectToggle,
    onOpenAttachModal,
}: GeneralMediaViewProps) {
    const { auth, assetCdnBaseUrl } = usePage<SharedData>().props;
    const userRoles = auth.roles ?? [];
    const assetCdnBase =
        typeof assetCdnBaseUrl === 'string' && assetCdnBaseUrl.trim() !== ''
            ? assetCdnBaseUrl.trim()
            : null;
    const catalog = useOrdersCatalog();
    const {
        createOrderItemsFromForm,
        getMenuItemForCategory,
        orderCatalogLoading,
        openOrder,
        refreshOpenOrder,
        applyParentOrderBadgeUpdate,
        removeOrderItemFromCart,
        commitOrderItemBulkWrite,
        submitOpenOrder,
        clearOpenOrderCart,
        orderInvoicesForOpenOrder,
    } = useOrderSlideoutCatalog();
    const slideout = resolveSlideoutCatalog(catalog);
    const broadcastMenuItem = getMenuItemForCategory(
        ORDER_MENU_CATEGORY_QUADRANTS.broadcast,
    );
    const apiSlideoutOrderId = catalog.slideoutApiOrderId;
    const canAdminEditInactiveRows =
        canStaffOverrideInactiveRowEdits(userRoles);
    const canEditAssignees = canAdminEditInactiveRows;
    const canEditStatus = isGtcStaffUser(auth.user);
    const { replaceVenueItem } = slideout;
    const usersWithFallback = useUsersWithFallback();

    const venueLineCatalog = useMemo((): OrdersVenueLineCatalog => {
        return {
            venue_items: slideout.venue_items,
            venue_item_assigned: slideout.venue_item_assigned,
            venue_item_notes: slideout.venue_item_notes,
        };
    }, [
        slideout.venue_items,
        slideout.venue_item_assigned,
        slideout.venue_item_notes,
    ]);

    const existingBroadcastRows = useMemo((): OrderItemsBroadcastRow[] => {
        if (!orderItem) {
            return [];
        }
        return slideout.venue_items.filter(
            (r): r is OrderItemsBroadcastRow =>
                r.type === 'broadcast' &&
                r.tour_venue_id === orderItem.orderVenue.id &&
                !r.is_pending,
        );
    }, [orderItem, slideout.venue_items]);

    const existingSocialRows = useMemo((): OrderItemsSocialRow[] => {
        if (!orderItem) {
            return [];
        }
        return slideout.venue_items.filter(
            (r): r is OrderItemsSocialRow =>
                r.type === 'social' &&
                r.tour_venue_id === orderItem.orderVenue.id &&
                !r.is_pending,
        );
    }, [orderItem, slideout.venue_items]);

    const existingRadioRows = useMemo((): OrderItemsRadioRow[] => {
        if (!orderItem) {
            return [];
        }
        return slideout.venue_items.filter(
            (r): r is OrderItemsRadioRow =>
                r.type === 'radio' &&
                r.tour_venue_id === orderItem.orderVenue.id &&
                !r.is_pending,
        );
    }, [orderItem, slideout.venue_items]);

    const orderItemStatusSelectOptions = useMemo(
        () => buildOrderItemStatusSelectOptions(),
        [],
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
    const [revisionTargetRow, setRevisionTargetRow] =
        useState<RevisionTargetRow | null>(null);
    const [revisionTableName, setRevisionTableName] = useState('');
    const inlineOriginalRef = useRef<{
        itemId: string | number;
        field: string;
        value: string | number;
    } | null>(null);
    const cellPersistGuardRef = useRef<string | null>(null);

    const openRevisionModal = useCallback(
        (row: RevisionTargetRow, tableName: string) => {
            if (!canInitiateOrderItemRevision(auth.user, row, userRoles)) {
                toast.warning(
                    'You do not have permission to request a revision on this line item.',
                );
                return;
            }
            setRevisionTargetRow(row);
            setRevisionTableName(tableName);
            setRevisionModalOpen(true);
        },
        [auth.user, userRoles],
    );

    const [deliverableUpdatingRowIds, setDeliverableUpdatingRowIds] = useState<
        ReadonlySet<string>
    >(() => new Set());

    const isDeliverableUpdating = useCallback(
        (rowId: string | number) =>
            deliverableUpdatingRowIds.has(String(rowId)),
        [deliverableUpdatingRowIds],
    );

    const handleApproveDeliverable = useCallback(
        async (row: RevisionTargetRow): Promise<boolean> => {
            if (!openOrder) {
                toast.error('Open an order before approving deliverables.');
                return false;
            }
            if (!canApproveOrderItemDeliverable(auth.user, row, userRoles)) {
                toast.warning(
                    'You do not have permission to approve this deliverable.',
                );
                return false;
            }

            const rowKey = String(row.id);
            setDeliverableUpdatingRowIds((prev) => new Set(prev).add(rowKey));
            try {
                const result = await commitOrderItemBulkWrite(
                    [Number(row.id)],
                    {
                        order_item_status_id:
                            ORDER_ITEM_STATUS_ID.outForDelivery,
                    },
                    'Deliverable approved.',
                );

                return result.ok;
            } finally {
                setDeliverableUpdatingRowIds((prev) => {
                    const next = new Set(prev);
                    next.delete(rowKey);
                    return next;
                });
            }
        },
        [openOrder, auth.user, userRoles, commitOrderItemBulkWrite],
    );
    const [statusFilter, setStatusFilter] = useState<MediaStatusFilter>([]);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);

    const resolveAssignedForRow = useCallback(
        (rowId: string | number): User[] => {
            if (openOrder) {
                const item = openOrder.order_items?.find(
                    (orderItem) => String(orderItem.id) === String(rowId),
                );
                if (item) {
                    return orderItemAssigneesToUsers(
                        item.assignees,
                        usersWithFallback,
                    );
                }
            }

            return getAssignedUsersForVenueItem(
                rowId,
                venueLineCatalog,
                usersWithFallback,
            );
        },
        [openOrder, venueLineCatalog, usersWithFallback],
    );

    const mapBroadcastRadioSocialRow = useCallback(
        (row: OrderItemsBroadcastRadioSocialRow, tableName: string) => {
            const statusOverride = apiSlideoutOrderId
                ? apiOrderItemTableStatus(row.id, openOrder)
                : undefined;

            const mediaRow = venueItemsMediaTableRow(
                row,
                resolveAssignedForRow(row.id),
                statusOverride,
            );
            const resolvedStatus =
                statusOverride ?? venueItemStatusIdToLabel(row.status_id);
            const showDeliverables = rowShowsDeliverables(
                row.has_deliverable_actions,
                resolvedStatus,
            );
            const canApprove =
                resolvedStatus === 'Client Review' &&
                canApproveOrderItemDeliverable(auth.user, mediaRow, userRoles);
            const downloadVariant =
                row.type === 'broadcast' ? 'broadcast' : 'simple';
            return {
                ...mediaRow,
                status: resolvedStatus,
                deliverables: showDeliverables
                    ? buildDeliverableCallbacks(
                          resolvedStatus,
                          openRevisionModal,
                          canApprove ? handleApproveDeliverable : undefined,
                          mediaRow,
                          tableName,
                          downloadVariant,
                      )
                    : undefined,
            };
        },
        [
            apiSlideoutOrderId,
            openOrder,
            resolveAssignedForRow,
            openRevisionModal,
            handleApproveDeliverable,
            auth.user,
            userRoles,
        ],
    );

    const venueBroadcastWithCallbacks = useMemo(() => {
        if (!orderItem) return [];
        return slideout.venue_items
            .filter(
                (r): r is OrderItemsBroadcastRadioSocialRow =>
                    r.type === 'broadcast' &&
                    r.tour_venue_id === orderItem.orderVenue.id,
            )
            .map((row) =>
                mapBroadcastRadioSocialRow(row, 'Broadcast & Streaming Video'),
            );
    }, [orderItem, slideout.venue_items, mapBroadcastRadioSocialRow]);

    const venueSocialLineWithCallbacks = useMemo(() => {
        if (!orderItem) return [];
        return slideout.venue_items
            .filter(
                (r): r is OrderItemsBroadcastRadioSocialRow =>
                    r.type === 'social' &&
                    r.tour_venue_id === orderItem.orderVenue.id,
            )
            .map((row) => mapBroadcastRadioSocialRow(row, 'Social Video'));
    }, [orderItem, slideout.venue_items, mapBroadcastRadioSocialRow]);

    const venueRadioWithCallbacks = useMemo(() => {
        if (!orderItem) return [];
        return slideout.venue_items
            .filter(
                (r): r is OrderItemsBroadcastRadioSocialRow =>
                    r.type === 'radio' &&
                    r.tour_venue_id === orderItem.orderVenue.id,
            )
            .map((row) => mapBroadcastRadioSocialRow(row, 'Radio'));
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
                const statusOverride = apiSlideoutOrderId
                    ? apiOrderItemTableStatus(row.id, openOrder)
                    : undefined;
                const resolvedStatus =
                    statusOverride ?? venueItemStatusIdToLabel(row.status_id);
                const staticRow = venueItemsArtTableRow(
                    row,
                    resolveAssignedForRow(row.id),
                );
                const showDeliverables = rowShowsDeliverables(
                    row.has_deliverable_actions,
                    resolvedStatus,
                );
                const rowForRevision: StaticAssetsTableRow = {
                    ...staticRow,
                    status: resolvedStatus,
                    status_id: row.status_id,
                };
                const canApprove =
                    resolvedStatus === 'Client Review' &&
                    canApproveOrderItemDeliverable(
                        auth.user,
                        rowForRevision,
                        userRoles,
                    );
                return {
                    ...rowForRevision,
                    deliverables: showDeliverables
                        ? buildDeliverableCallbacks(
                              resolvedStatus,
                              openRevisionModal,
                              canApprove ? handleApproveDeliverable : undefined,
                              rowForRevision,
                              'Key Art & Static Assets',
                              'simple',
                          )
                        : undefined,
                };
            });
    }, [
        orderItem,
        slideout.venue_items,
        apiSlideoutOrderId,
        openOrder,
        resolveAssignedForRow,
        openRevisionModal,
        handleApproveDeliverable,
        auth.user,
        userRoles,
    ]);

    const {
        localData: localBroadcastRows,
        editingCell: broadcastEditingCell,
        handleDoubleClick: handleBroadcastCellDoubleClick,
        handleCellChange: handleBroadcastCellChange,
        handleCellBlur: handleBroadcastCellBlur,
        handleCellKeyDown: handleBroadcastCellKeyDown,
        isEditing: isBroadcastCellEditing,
        bulkPatchByIds: bulkPatchBroadcastRows,
        patchRowFields: patchBroadcastRowFields,
        localDataRef: broadcastLocalDataRef,
    } = useEditableTable<MediaTableRow>({
        data: venueBroadcastWithCallbacks,
        getId: (r) => r.id,
    });

    const {
        localData: localSocialLineRows,
        editingCell: socialLineEditingCell,
        handleDoubleClick: handleSocialLineCellDoubleClick,
        handleCellChange: handleSocialLineCellChange,
        handleCellBlur: handleSocialLineCellBlur,
        handleCellKeyDown: handleSocialLineCellKeyDown,
        isEditing: isSocialLineCellEditing,
        bulkPatchByIds: bulkPatchSocialLineRows,
        patchRowFields: patchSocialLineRowFields,
        localDataRef: socialLineLocalDataRef,
    } = useEditableTable<MediaTableRow>({
        data: venueSocialLineWithCallbacks,
        getId: (r) => r.id,
    });

    const {
        localData: localRadioRows,
        editingCell: radioEditingCell,
        handleDoubleClick: handleRadioCellDoubleClick,
        handleCellChange: handleRadioCellChange,
        handleCellBlur: handleRadioCellBlur,
        handleCellKeyDown: handleRadioCellKeyDown,
        isEditing: isRadioCellEditing,
        bulkPatchByIds: bulkPatchRadioRows,
        patchRowFields: patchRadioRowFields,
        localDataRef: radioLocalDataRef,
    } = useEditableTable<MediaTableRow>({
        data: venueRadioWithCallbacks,
        getId: (r) => r.id,
    });

    const {
        localData: localStaticRows,
        editingCell: staticEditingCell,
        handleDoubleClick: handleStaticCellDoubleClick,
        handleCellChange: handleStaticCellChange,
        handleCellBlur: handleStaticCellBlur,
        handleCellKeyDown: handleStaticCellKeyDown,
        isEditing: isStaticCellEditing,
        bulkPatchByIds: bulkPatchStaticRows,
        patchRowFields: patchStaticRowFields,
        localDataRef: staticLocalDataRef,
    } = useEditableTable<StaticAssetsTableRow>({
        data: venueArtWithCallbacks,
        getId: (r) => r.id,
    });

    const [dueDateModalOpen, setDueDateModalOpen] = useState(false);
    const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
    const [clearCartModalOpen, setClearCartModalOpen] = useState(false);
    const [isClearingCart, setIsClearingCart] = useState(false);
    const [assignedModalOpen, setAssignedModalOpen] = useState(false);
    const [dueDateSeedIso, setDueDateSeedIso] = useState<string | undefined>();
    const [assignedSeed, setAssignedSeed] = useState<User[]>([]);
    const [assigneeSaveError, setAssigneeSaveError] = useState<
        string | undefined
    >();

    const [audioModalOpen, setAudioModalOpen] = useState(false);
    const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
    const [broadcastModalMode, setBroadcastModalMode] = useState<
        'add' | 'edit'
    >('add');
    const [broadcastEditRow, setBroadcastEditRow] =
        useState<OrderItemsBroadcastRow | null>(null);
    const [broadcastFieldErrors, setBroadcastFieldErrors] = useState<
        Record<string, string[]> | undefined
    >();
    const [socialModalMode, setSocialModalMode] = useState<'add' | 'edit'>(
        'add',
    );
    const [socialEditRow, setSocialEditRow] =
        useState<OrderItemsSocialRow | null>(null);
    const [socialFieldErrors, setSocialFieldErrors] = useState<
        Record<string, string[]> | undefined
    >();
    const [radioModalMode, setRadioModalMode] = useState<'add' | 'edit'>('add');
    const [radioEditRow, setRadioEditRow] = useState<OrderItemsRadioRow | null>(
        null,
    );
    const [radioFieldErrors, setRadioFieldErrors] = useState<
        Record<string, string[]> | undefined
    >();
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
        setBroadcastFieldErrors(undefined);
    }, []);

    const handleBroadcastAdd = useCallback(
        async (form: AddBroadcastStreamingFormValues) => {
            setBroadcastFieldErrors(undefined);
            const result = await createOrderItemsFromForm(
                broadcastCreateAdapter,
                form,
            );
            if (result.failed && result.errors) {
                setBroadcastFieldErrors(result.errors);
            }
            return result;
        },
        [createOrderItemsFromForm],
    );

    const closeSocialVideoModal = useCallback(() => {
        setSocialVideoModalOpen(false);
        setSocialModalMode('add');
        setSocialEditRow(null);
        setSocialFieldErrors(undefined);
    }, []);

    const handleSocialAdd = useCallback(
        async (form: AddSocialVideoFormValues) => {
            setSocialFieldErrors(undefined);
            const result = await createOrderItemsFromForm(
                socialCreateAdapter,
                form,
            );
            if (result.failed && result.errors) {
                setSocialFieldErrors(result.errors);
            }
            return result;
        },
        [createOrderItemsFromForm],
    );

    const handleRadioAdd = useCallback(
        async (form: AddAudioFormValues) => {
            setRadioFieldErrors(undefined);
            const result = await createOrderItemsFromForm(
                radioCreateAdapter,
                form,
            );
            if (result.failed && result.errors) {
                setRadioFieldErrors(result.errors);
            }
            return result;
        },
        [createOrderItemsFromForm],
    );

    const handleKeyArtAdd = useCallback(
        async (form: AddKeyArtStaticAssetsFormValues) => {
            const result = await createOrderItemsFromForm(
                artCreateAdapter,
                form,
            );
            return result;
        },
        [createOrderItemsFromForm],
    );

    const closeAudioModal = useCallback(() => {
        setAudioModalOpen(false);
        setRadioModalMode('add');
        setRadioEditRow(null);
        setRadioFieldErrors(undefined);
    }, []);

    const handleBroadcastEditSave = useCallback(
        async (row: OrderItemsBroadcastRow) => {
            if (!openOrder) {
                toast.error('Open an order before editing line items.');
                return { failed: true };
            }

            if (!canEditOrderLineItem(auth.user, row, userRoles)) {
                toast.error('You do not have permission to edit this line.');
                return { failed: true };
            }

            setBroadcastFieldErrors(undefined);

            const patch = broadcastUpdateAdapter.rowToFullBulkPatch(
                row,
                openOrder,
            );
            const result = await commitOrderItemBulkWrite(
                [Number(row.id)],
                patch,
                'Line item updated.',
            );

            if (!result.ok) {
                if (result.errors && Object.keys(result.errors).length > 0) {
                    setBroadcastFieldErrors(result.errors);
                    return { failed: true };
                }
                return { failed: true };
            }

            closeBroadcastModal();
            return { failed: false };
        },
        [openOrder, auth.user, commitOrderItemBulkWrite, closeBroadcastModal],
    );

    const handleSocialEditSave = useCallback(
        async (row: OrderItemsSocialRow) => {
            if (!openOrder) {
                toast.error('Open an order before editing line items.');
                return { failed: true };
            }

            if (!canEditOrderLineItem(auth.user, row, userRoles)) {
                toast.error('You do not have permission to edit this line.');
                return { failed: true };
            }

            const validation = validateSocialRowSpecifications(row);
            if (!validation.ok) {
                toast.error(validation.message);
                return { failed: true };
            }

            setSocialFieldErrors(undefined);

            const patch = socialUpdateAdapter.rowToFullBulkPatch(
                row,
                openOrder,
            );
            const result = await commitOrderItemBulkWrite(
                [Number(row.id)],
                patch,
                'Line item updated.',
            );

            if (!result.ok) {
                if (result.errors && Object.keys(result.errors).length > 0) {
                    setSocialFieldErrors(result.errors);
                    return { failed: true };
                }
                return { failed: true };
            }

            closeSocialVideoModal();
            return { failed: false };
        },
        [
            openOrder,
            auth.user,
            userRoles,
            commitOrderItemBulkWrite,
            closeSocialVideoModal,
        ],
    );

    const handleRadioEditSave = useCallback(
        async (row: OrderItemsRadioRow) => {
            if (!openOrder) {
                toast.error('Open an order before editing line items.');
                return { failed: true };
            }

            if (!canEditOrderLineItem(auth.user, row, userRoles)) {
                toast.error('You do not have permission to edit this line.');
                return { failed: true };
            }

            const validation = validateRadioRowSpecifications(row);
            if (!validation.ok) {
                toast.error(validation.message);
                return { failed: true };
            }

            setRadioFieldErrors(undefined);

            const patch = radioUpdateAdapter.rowToFullBulkPatch(row, openOrder);
            const result = await commitOrderItemBulkWrite(
                [Number(row.id)],
                patch,
                'Line item updated.',
            );

            if (!result.ok) {
                if (result.errors && Object.keys(result.errors).length > 0) {
                    setRadioFieldErrors(result.errors);
                    return { failed: true };
                }
                return { failed: true };
            }

            closeAudioModal();
            return { failed: false };
        },
        [
            openOrder,
            auth.user,
            userRoles,
            commitOrderItemBulkWrite,
            closeAudioModal,
        ],
    );

    const handleVideoSectionPreviewClick = useCallback(
        (row: MediaTableRow, iconIndex: number) => {
            const assetPath = mediaTableRowAssetPath(row);
            if (!canShowMediaPreview(row.status, assetPath)) {
                return;
            }

            if (iconIndex === 1) {
                if (!assetPath) {
                    return;
                }
                void navigator.clipboard.writeText(assetPath).catch(() => {
                    toast.error('Could not copy asset path.');
                });
                return;
            }

            if (iconIndex !== 0) {
                return;
            }

            if (row.previewImageUrl) {
                setImagePreview({
                    src: row.previewImageUrl,
                    title: `${row.isci} – ${row.cutName}`,
                });
                return;
            }

            const url = resolveAssetPreviewUrl(assetPath, assetCdnBase);
            if (!url) {
                toast.error('Preview is unavailable.');
                return;
            }

            setVideoPreviewRow({ ...row, previewVideoUrl: url });
            setAudioPlaceholderMode(false);
            setVideoPlayerModalOpen(true);
        },
        [assetCdnBase],
    );

    const handleAudioSectionPreviewClick = useCallback(
        (row: MediaTableRow, iconIndex: number) => {
            const assetPath = mediaTableRowAssetPath(row);
            if (!canShowMediaPreview(row.status, assetPath)) {
                return;
            }

            if (iconIndex !== 0) {
                return;
            }

            if (row.previewImageUrl) {
                setImagePreview({
                    src: row.previewImageUrl,
                    title: `${row.isci} – ${row.cutName}`,
                });
                return;
            }

            const url = resolveAssetPreviewUrl(assetPath, assetCdnBase);
            if (!url) {
                toast.error('Preview is unavailable.');
                return;
            }

            setVideoPreviewRow({ ...row, previewVideoUrl: url });
            setAudioPlaceholderMode(false);
            setVideoPlayerModalOpen(true);
        },
        [assetCdnBase],
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

    const hasCartItems = useMemo(
        () => orderHasStillInCartItems(openOrder),
        [openOrder],
    );

    const cartLines = useMemo(
        () => orderCartBillingLines(openOrder),
        [openOrder],
    );

    const cartTotal = useMemo(
        () => orderCartBillingTotal(openOrder),
        [openOrder],
    );

    const handleSubmitOrder = useCallback(async () => {
        if (isSubmittingOrder || !openOrder || !hasCartItems) {
            return;
        }

        setIsSubmittingOrder(true);
        try {
            await submitOpenOrder();
            toast.success('Order submitted.');
        } catch (error) {
            if (error instanceof OrderSubmitApiError && error.status === 409) {
                toast.error(
                    error.message ||
                        'Your cart is empty or this order has already been submitted.',
                );
                return;
            }

            toast.error('Failed to submit order.');
        } finally {
            setIsSubmittingOrder(false);
        }
    }, [hasCartItems, isSubmittingOrder, openOrder, submitOpenOrder]);

    const handleClearCart = useCallback(async () => {
        if (isClearingCart || !openOrder || !hasCartItems) {
            return;
        }

        setIsClearingCart(true);
        try {
            const response = await clearOpenOrderCart();
            toast.success(response.message);
            setClearCartModalOpen(false);
        } catch (error) {
            if (
                error instanceof OrderCartClearApiError &&
                error.status === 409
            ) {
                toast.error(
                    error.message ||
                        'Your cart is empty or this order has already been submitted.',
                );
                return;
            }

            if (error instanceof OrderCartClearApiError) {
                toast.error(error.message || 'Failed to clear cart.');
                return;
            }

            toast.error('Failed to clear cart.');
        } finally {
            setIsClearingCart(false);
        }
    }, [clearOpenOrderCart, hasCartItems, isClearingCart, openOrder]);

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
            setAssigneeSaveError(undefined);
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

    const handleCellDoubleClickWithOriginal = useCallback(
        (
            rows: readonly (MediaTableRow | StaticAssetsTableRow)[],
            handleDoubleClick: (
                itemId: string | number,
                field: string,
                scope?: string,
            ) => void,
            itemId: string | number,
            field: string,
            scope?: string,
        ) => {
            const row = rows.find((r) => r.id === itemId);
            if (row) {
                if (field === 'duration_seconds' && 'duration_seconds' in row) {
                    inlineOriginalRef.current = {
                        itemId,
                        field,
                        value:
                            'duration_wire' in row && row.duration_wire
                                ? row.duration_wire
                                : String(row.duration_seconds),
                    };
                } else if (field === 'status') {
                    inlineOriginalRef.current = {
                        itemId,
                        field,
                        value: row.status,
                    };
                } else if (field === 'spot_type' || field === 'cut') {
                    const mediaRow = row as MediaTableRow;
                    inlineOriginalRef.current = {
                        itemId,
                        field,
                        value: String(
                            field === 'spot_type'
                                ? (mediaRow.spot_type ?? '')
                                : (mediaRow.cut ?? ''),
                        ),
                    };
                } else if (field === 'cutName') {
                    inlineOriginalRef.current = {
                        itemId,
                        field,
                        value: row.cutName,
                    };
                } else if (field === 'width' || field === 'height') {
                    const staticRow = row as StaticAssetsTableRow;
                    inlineOriginalRef.current = {
                        itemId,
                        field,
                        value: staticRow[field] ?? '',
                    };
                }
            }
            handleDoubleClick(itemId, field, scope);
        },
        [],
    );

    const handleTableCellBlurWithPersist = useCallback(
        async (tableScope: 'broadcast' | 'socialLine' | 'radio' | 'static') => {
            const ctxByScope = {
                broadcast: {
                    editing: broadcastEditingCell,
                    dataRef: broadcastLocalDataRef,
                    handleBlur: handleBroadcastCellBlur,
                    handleChange: handleBroadcastCellChange,
                    patchRowFields: patchBroadcastRowFields,
                },
                socialLine: {
                    editing: socialLineEditingCell,
                    dataRef: socialLineLocalDataRef,
                    handleBlur: handleSocialLineCellBlur,
                    handleChange: handleSocialLineCellChange,
                    patchRowFields: patchSocialLineRowFields,
                },
                radio: {
                    editing: radioEditingCell,
                    dataRef: radioLocalDataRef,
                    handleBlur: handleRadioCellBlur,
                    handleChange: handleRadioCellChange,
                    patchRowFields: patchRadioRowFields,
                },
                static: {
                    editing: staticEditingCell,
                    dataRef: staticLocalDataRef,
                    handleBlur: handleStaticCellBlur,
                    handleChange: handleStaticCellChange,
                    patchRowFields: patchStaticRowFields,
                },
            } as const;

            const ctx = ctxByScope[tableScope];
            const editing = ctx.editing;
            const row =
                editing != null
                    ? ctx.dataRef.current.find(
                          (r) => String(r.id) === String(editing.itemId),
                      )
                    : undefined;

            const scopeMatches =
                tableScope === 'static'
                    ? editing?.scope == null
                    : editing?.scope === tableScope;

            if (!editing || !scopeMatches || !row || !openOrder) {
                ctx.handleBlur();
                return;
            }

            const guardKey = `${tableScope}:${editing.itemId}:${editing.field}`;
            if (cellPersistGuardRef.current === guardKey) {
                ctx.handleBlur();
                return;
            }
            cellPersistGuardRef.current = guardKey;
            ctx.handleBlur();

            if (editing.field === 'duration_seconds') {
                if (
                    tableScope !== 'broadcast' &&
                    tableScope !== 'socialLine' &&
                    tableScope !== 'radio'
                ) {
                    cellPersistGuardRef.current = null;
                    return;
                }
                if (!canEditOrderLineItem(auth.user, row, userRoles)) {
                    cellPersistGuardRef.current = null;
                    return;
                }
                const original = inlineOriginalRef.current;
                const mediaRow = row as MediaTableRow;
                const durationWire =
                    mediaRow.duration_wire ?? String(mediaRow.duration_seconds);
                if (durationWire.trim() === '') {
                    if (
                        original?.itemId === row.id &&
                        original.field === 'duration_seconds'
                    ) {
                        const revertedSeconds =
                            parseDurationWireAsSeconds(
                                String(original.value),
                            ) ??
                            (Number.parseInt(String(original.value), 10) || 0);
                        ctx.handleChange(
                            row.id,
                            'duration_wire',
                            String(original.value),
                        );
                        ctx.handleChange(
                            row.id,
                            'duration_seconds',
                            revertedSeconds,
                        );
                    }
                    inlineOriginalRef.current = null;
                    cellPersistGuardRef.current = null;
                    return;
                }
                if (
                    original?.itemId === row.id &&
                    original.field === 'duration_seconds' &&
                    isInlineDurationUnchanged(
                        String(original.value),
                        durationWire,
                    )
                ) {
                    inlineOriginalRef.current = null;
                    cellPersistGuardRef.current = null;
                    return;
                }
                const durationAdapter = mediaLinePatchAdapterForScope(
                    tableScope as 'broadcast' | 'socialLine' | 'radio',
                );
                const selectedIds = [...selectedRowIds];
                const bulkTargetIds =
                    selectedIds.length > 1 && selectedIds.includes(row.id)
                        ? selectedIds.map((id) => Number(id))
                        : [Number(row.id)];
                const result = await commitOrderItemBulkWrite(
                    bulkTargetIds,
                    durationAdapter.durationPatch(durationWire),
                );
                if (result.ok) {
                    if (ctx.patchRowFields) {
                        applyOptimisticDurationBulkPatch(
                            bulkTargetIds,
                            durationWire,
                            ctx.dataRef,
                            ctx.patchRowFields,
                        );
                    }
                } else if (
                    original?.itemId === row.id &&
                    original.field === 'duration_seconds'
                ) {
                    const revertedSeconds =
                        Number.parseInt(String(original.value), 10) || 0;
                    ctx.handleChange(
                        row.id,
                        'duration_wire',
                        String(original.value),
                    );
                    ctx.handleChange(
                        row.id,
                        'duration_seconds',
                        revertedSeconds,
                    );
                }
                inlineOriginalRef.current = null;
                cellPersistGuardRef.current = null;
                return;
            }

            if (editing.field === 'spot_type' || editing.field === 'cut') {
                if (tableScope === 'static') {
                    cellPersistGuardRef.current = null;
                    return;
                }
                if (!canEditOrderLineItem(auth.user, row, userRoles)) {
                    cellPersistGuardRef.current = null;
                    return;
                }
                const mediaRow = row as MediaTableRow;
                const currentValue =
                    editing.field === 'spot_type'
                        ? (mediaRow.spot_type ?? '')
                        : (mediaRow.cut ?? '');
                const original = inlineOriginalRef.current;
                if (
                    original?.itemId === row.id &&
                    original.field === editing.field &&
                    String(original.value) === currentValue
                ) {
                    inlineOriginalRef.current = null;
                    cellPersistGuardRef.current = null;
                    return;
                }
                const lineAdapter = mediaLineUpdateAdapterForScope(tableScope);
                const patch =
                    editing.field === 'spot_type'
                        ? lineAdapter.typePatch(currentValue)
                        : lineAdapter.cutPatch(currentValue);
                const selectedIds = [...selectedRowIds];
                const bulkTargetIds =
                    selectedIds.length > 1 && selectedIds.includes(row.id)
                        ? selectedIds.map((id) => Number(id))
                        : [Number(row.id)];
                const result = await commitOrderItemBulkWrite(
                    bulkTargetIds,
                    patch,
                );
                if (result.ok) {
                    if (ctx.patchRowFields) {
                        applyOptimisticMediaLineBulkPatch(
                            bulkTargetIds,
                            editing.field,
                            currentValue,
                            ctx.dataRef,
                            ctx.patchRowFields,
                        );
                    }
                } else if (
                    !result.ok &&
                    original?.itemId === row.id &&
                    original.field === editing.field &&
                    ctx.patchRowFields
                ) {
                    const revertedSpotType =
                        original.field === 'spot_type'
                            ? String(original.value)
                            : (mediaRow.spot_type ?? '');
                    const revertedCut =
                        original.field === 'cut'
                            ? String(original.value)
                            : (mediaRow.cut ?? '');
                    ctx.patchRowFields(row.id, {
                        spot_type: revertedSpotType,
                        cut: revertedCut,
                        cutName: venueItemMediaLineLabel(
                            revertedSpotType,
                            revertedCut,
                        ),
                    });
                }
                inlineOriginalRef.current = null;
                cellPersistGuardRef.current = null;
                return;
            }

            if (
                tableScope === 'static' &&
                (editing.field === 'cutName' ||
                    editing.field === 'width' ||
                    editing.field === 'height')
            ) {
                if (!canEditOrderLineItem(auth.user, row, userRoles)) {
                    cellPersistGuardRef.current = null;
                    return;
                }
                const staticRow = row as StaticAssetsTableRow;
                const original = inlineOriginalRef.current;
                const selectedIds = [...selectedRowIds];
                const bulkTargetIds =
                    selectedIds.length > 1 && selectedIds.includes(row.id)
                        ? selectedIds.map((id) => Number(id))
                        : [Number(row.id)];

                if (editing.field === 'cutName') {
                    const currentValue = staticRow.cutName ?? '';
                    if (
                        original?.itemId === row.id &&
                        original.field === 'cutName' &&
                        String(original.value) === currentValue
                    ) {
                        inlineOriginalRef.current = null;
                        cellPersistGuardRef.current = null;
                        return;
                    }
                    const result = await commitOrderItemBulkWrite(
                        bulkTargetIds,
                        artUpdateAdapter.typePatch(currentValue),
                    );
                    if (
                        !result.ok &&
                        original?.itemId === row.id &&
                        original.field === 'cutName' &&
                        ctx.patchRowFields
                    ) {
                        ctx.patchRowFields(row.id, {
                            cutName: String(original.value),
                        });
                    }
                } else {
                    const dimensionField =
                        editing.field === 'width' ? 'width' : 'height';
                    const currentValue = parseArtDimensionInput(
                        staticRow[dimensionField] ?? '',
                    );
                    const originalValue =
                        original?.itemId === row.id &&
                        original.field === dimensionField
                            ? parseArtDimensionInput(String(original.value))
                            : null;
                    if (currentValue === originalValue) {
                        inlineOriginalRef.current = null;
                        cellPersistGuardRef.current = null;
                        return;
                    }
                    const patch =
                        dimensionField === 'width'
                            ? artUpdateAdapter.widthPatch(currentValue)
                            : artUpdateAdapter.heightPatch(currentValue);
                    const result = await commitOrderItemBulkWrite(
                        bulkTargetIds,
                        patch,
                    );
                    if (
                        !result.ok &&
                        original?.itemId === row.id &&
                        original.field === dimensionField &&
                        ctx.patchRowFields
                    ) {
                        ctx.patchRowFields(row.id, {
                            [dimensionField]: originalValue,
                        });
                    }
                }
                inlineOriginalRef.current = null;
                cellPersistGuardRef.current = null;
                return;
            }

            if (editing.field === 'status') {
                if (!canEditOrderLineItemStatus(auth.user, row, userRoles)) {
                    cellPersistGuardRef.current = null;
                    return;
                }
                const statusId = venueItemStatusLabelToId(row.status);
                const selectedIds = [...selectedRowIds];
                const bulkTargetIds =
                    selectedIds.length > 1 && selectedIds.includes(row.id)
                        ? selectedIds.map((id) => Number(id))
                        : [Number(row.id)];
                if (statusId == null) {
                    cellPersistGuardRef.current = null;
                    return;
                }
                const statusAdapter =
                    tableScope === 'static'
                        ? artUpdateAdapter
                        : mediaLinePatchAdapterForScope(
                              tableScope as
                                  | 'broadcast'
                                  | 'socialLine'
                                  | 'radio',
                          );
                const original = inlineOriginalRef.current;
                if (
                    original?.itemId === row.id &&
                    original.field === 'status' &&
                    isInlineStatusUnchanged(String(original.value), row.status)
                ) {
                    inlineOriginalRef.current = null;
                    cellPersistGuardRef.current = null;
                    return;
                }
                const result = await commitOrderItemBulkWrite(
                    bulkTargetIds,
                    statusAdapter.statusPatch(statusId),
                );
                if (
                    !result.ok &&
                    original?.itemId === row.id &&
                    original.field === 'status'
                ) {
                    ctx.handleChange(row.id, 'status', original.value);
                }
                inlineOriginalRef.current = null;
                cellPersistGuardRef.current = null;
            }
        },
        [
            broadcastEditingCell,
            broadcastLocalDataRef,
            handleBroadcastCellBlur,
            handleBroadcastCellChange,
            patchBroadcastRowFields,
            socialLineEditingCell,
            socialLineLocalDataRef,
            handleSocialLineCellBlur,
            handleSocialLineCellChange,
            patchSocialLineRowFields,
            radioEditingCell,
            radioLocalDataRef,
            handleRadioCellBlur,
            handleRadioCellChange,
            patchRadioRowFields,
            staticEditingCell,
            staticLocalDataRef,
            handleStaticCellBlur,
            handleStaticCellChange,
            patchStaticRowFields,
            openOrder,
            auth.user,
            userRoles,
            commitOrderItemBulkWrite,
            selectedRowIds,
        ],
    );

    const handleTableCellKeyDownWithPersist = useCallback(
        (
            tableScope: 'broadcast' | 'socialLine' | 'radio' | 'static',
            handleCellKeyDown: (
                e: React.KeyboardEvent<HTMLElement>,
                itemId: string | number,
                field: string,
                scope?: string,
            ) => void,
        ) =>
            (
                e: React.KeyboardEvent<HTMLElement>,
                itemId: string | number,
                field: string,
                scope?: string,
            ) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    void handleTableCellBlurWithPersist(tableScope);
                    return;
                }
                handleCellKeyDown(e, itemId, field, scope);
            },
        [handleTableCellBlurWithPersist],
    );

    const handleDueDateBulkSave = useCallback(
        async ({ dueDateIso }: { dueDateIso: string }) => {
            if (!openOrder) {
                toast.error('Open an order before updating due dates.');
                return;
            }

            const selectedRows = [
                ...localBroadcastRows,
                ...localSocialLineRows,
                ...localRadioRows,
                ...localStaticRows,
            ].filter((row) => selectedRowIds.has(row.id));

            const writable = assertBulkSelectionWritable(
                selectedRows,
                auth.user,
                userRoles,
            );
            if (!writable.ok) {
                toast.warning(writable.message);
                return;
            }

            const rowsToUpdate = selectedRows.filter((row) => {
                const currentIso = tableDueDateDisplayToIso(row.dueDate);
                return currentIso !== dueDateIso;
            });

            if (rowsToUpdate.length === 0) {
                setDueDateModalOpen(false);
                return;
            }

            const orderItemIds = rowsToUpdate.map((row) => Number(row.id));
            const result = await commitOrderItemBulkWrite(orderItemIds, {
                due_date: dueDateIso,
            });
            if (result.ok) {
                setDueDateModalOpen(false);
            }
        },
        [
            openOrder,
            localBroadcastRows,
            localSocialLineRows,
            localRadioRows,
            localStaticRows,
            selectedRowIds,
            auth.user,
            userRoles,
            commitOrderItemBulkWrite,
        ],
    );

    const handleAssignedBulkSave = useCallback(
        async ({ assigned }: { assigned: User[] }) => {
            if (!canEditAssignees) {
                return;
            }

            if (!openOrder) {
                toast.error('Open an order before updating assignees.');
                return;
            }

            const frozenStatuses = new Set(['Cancelled', 'Revision Request']);
            const selectedRows = [
                ...localBroadcastRows,
                ...localSocialLineRows,
                ...localRadioRows,
                ...localStaticRows,
            ].filter((row) => selectedRowIds.has(row.id));

            if (
                !canAdminEditInactiveRows &&
                selectedRows.some((row) => frozenStatuses.has(row.status))
            ) {
                toast.warning(
                    'Cannot update assignees on cancelled or revision-requested lines.',
                );
                return;
            }

            const userIds = assigned.map((user) => user.id);
            const rowsToUpdate = selectedRows.filter(
                (row) => !rowAssigneesUnchanged(row.assigned, userIds),
            );

            if (rowsToUpdate.length === 0) {
                setAssigneeSaveError(undefined);
                setAssignedModalOpen(false);
                return;
            }

            const results = await Promise.allSettled(
                rowsToUpdate.map((row) =>
                    syncOrderItemAssignees(Number(row.id), userIds),
                ),
            );

            const fulfilled = results.filter(
                (
                    result,
                ): result is PromiseFulfilledResult<
                    Awaited<ReturnType<typeof syncOrderItemAssignees>>
                > => result.status === 'fulfilled',
            );
            const succeeded = fulfilled.length;
            const latestParentUpdate = fulfilled
                .map((result) => result.value.parent_order_update)
                .filter(Boolean)
                .at(-1);
            applyParentOrderBadgeUpdate(latestParentUpdate);
            const failed = results.length - succeeded;

            if (succeeded === results.length) {
                toast.success('Assignees updated.');
                setAssigneeSaveError(undefined);
                setAssignedModalOpen(false);
            } else if (succeeded > 0) {
                toast.warning(
                    `Assigned staff to ${succeeded} item(s), but failed on ${failed} item(s).`,
                );
                setAssigneeSaveError(undefined);
                setAssignedModalOpen(false);
            } else {
                const firstRejected = results.find(
                    (result) => result.status === 'rejected',
                ) as PromiseRejectedResult | undefined;
                const reason = firstRejected?.reason;

                if (reason instanceof OrderItemApiError) {
                    const validationMessage = reason.errors
                        ? Object.values(reason.errors).flat()[0]
                        : undefined;
                    const message =
                        reason.status === 403
                            ? reason.message ||
                              'You do not have permission to update assignees.'
                            : (validationMessage ?? reason.message);
                    setAssigneeSaveError(message);
                    toast.error(message);
                } else {
                    const message = 'Could not update assignees.';
                    setAssigneeSaveError(message);
                    toast.error(message);
                }
            }

            if (!latestParentUpdate) {
                await refreshOpenOrder(openOrder.id);
            }
        },
        [
            canEditAssignees,
            canAdminEditInactiveRows,
            openOrder,
            localBroadcastRows,
            localSocialLineRows,
            localRadioRows,
            localStaticRows,
            selectedRowIds,
            applyParentOrderBadgeUpdate,
            refreshOpenOrder,
        ],
    );

    const handleRevisionSubmit = useCallback(
        async (
            revisionMessage: string,
            targetRow: RevisionTargetRow,
            tableName: string,
        ) => {
            const message = revisionMessage.trim();
            if (!message) {
                toast.error('Please enter a revision comment.');
                return;
            }
            if (!openOrder) {
                return;
            }

            const isci =
                'isci' in targetRow && targetRow.isci
                    ? targetRow.isci
                    : targetRow.cutName;

            try {
                await reviseOrderItem(Number(targetRow.id), message);
                const chatPosted = await sendChatMessage(
                    plainTextToChatDoc(message),
                    {
                        message_type: 'revision_request',
                        metadata: {
                            tableName,
                            isci,
                        },
                    },
                );
                await refreshOpenOrder(openOrder.id);
                if (chatPosted) {
                    toast.success('Revision request submitted.');
                } else {
                    toast.warning(
                        'Revision saved, but comment could not be posted to chat.',
                    );
                }
                setRevisionTargetRow(null);
                setRevisionTableName('');
                setRevisionModalOpen(false);
            } catch (error) {
                toast.error(
                    error instanceof OrderItemApiError
                        ? error.message
                        : 'Failed to submit revision request.',
                );
            }
        },
        [openOrder, sendChatMessage, refreshOpenOrder],
    );

    const sharedBroadcastCellEditing = {
        onCellChange: createMediaLineCellChangeHandler(
            handleBroadcastCellChange,
            patchBroadcastRowFields,
            broadcastLocalDataRef,
        ),
        onCellDoubleClick: (
            itemId: string | number,
            field: string,
            scope?: string,
        ) =>
            handleCellDoubleClickWithOriginal(
                localBroadcastRows,
                handleBroadcastCellDoubleClick,
                itemId,
                field,
                scope,
            ),
        onCellBlur: () => {
            void handleTableCellBlurWithPersist('broadcast');
        },
        onCellKeyDown: handleTableCellKeyDownWithPersist(
            'broadcast',
            createMediaLineCellKeyDownHandler(
                handleBroadcastCellKeyDown,
                patchBroadcastRowFields,
                broadcastLocalDataRef,
            ),
        ),
        isCellEditing: isBroadcastCellEditing,
    };

    const sharedSocialLineCellEditing = {
        onCellChange: createMediaLineCellChangeHandler(
            handleSocialLineCellChange,
            patchSocialLineRowFields,
            socialLineLocalDataRef,
        ),
        onCellDoubleClick: (
            itemId: string | number,
            field: string,
            scope?: string,
        ) =>
            handleCellDoubleClickWithOriginal(
                localSocialLineRows,
                handleSocialLineCellDoubleClick,
                itemId,
                field,
                scope,
            ),
        onCellBlur: () => {
            void handleTableCellBlurWithPersist('socialLine');
        },
        onCellKeyDown: handleTableCellKeyDownWithPersist(
            'socialLine',
            createMediaLineCellKeyDownHandler(
                handleSocialLineCellKeyDown,
                patchSocialLineRowFields,
                socialLineLocalDataRef,
            ),
        ),
        isCellEditing: isSocialLineCellEditing,
    };

    const sharedRadioCellEditing = {
        onCellChange: createMediaLineCellChangeHandler(
            handleRadioCellChange,
            patchRadioRowFields,
            radioLocalDataRef,
        ),
        onCellDoubleClick: (
            itemId: string | number,
            field: string,
            scope?: string,
        ) =>
            handleCellDoubleClickWithOriginal(
                localRadioRows,
                handleRadioCellDoubleClick,
                itemId,
                field,
                scope,
            ),
        onCellBlur: () => {
            void handleTableCellBlurWithPersist('radio');
        },
        onCellKeyDown: handleTableCellKeyDownWithPersist(
            'radio',
            createMediaLineCellKeyDownHandler(
                handleRadioCellKeyDown,
                patchRadioRowFields,
                radioLocalDataRef,
            ),
        ),
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

    const filteredAudioData = useMemo(
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
                    allowEditInactiveRows={canAdminEditInactiveRows}
                    canEditStatus={canEditStatus}
                    orderItemStatusSelectOptions={orderItemStatusSelectOptions}
                    isDeliverableUpdating={isDeliverableUpdating}
                    selectedRowIds={selectedRowIds}
                    onRowSelectToggle={onRowSelectToggle}
                    onBulkEditDueDateDoubleClick={openDueDateBulkEdit}
                    onBulkEditAssignedDoubleClick={openAssignedBulkEdit}
                    canEditAssignees={canEditAssignees}
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
                    isEditLineDisabled={(row) =>
                        isOrderLineItemEditDisabled(row, auth.user, userRoles)
                    }
                    canRemoveFromCart={
                        apiSlideoutOrderId
                            ? isMediaTableRowStillInCart
                            : undefined
                    }
                    onRemoveFromCart={
                        apiSlideoutOrderId
                            ? (row) => {
                                  void removeOrderItemFromCart(Number(row.id));
                              }
                            : undefined
                    }
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
                    allowEditInactiveRows={canAdminEditInactiveRows}
                    canEditStatus={canEditStatus}
                    orderItemStatusSelectOptions={orderItemStatusSelectOptions}
                    isDeliverableUpdating={isDeliverableUpdating}
                    selectedRowIds={selectedRowIds}
                    onRowSelectToggle={onRowSelectToggle}
                    onBulkEditDueDateDoubleClick={openDueDateBulkEdit}
                    onBulkEditAssignedDoubleClick={openAssignedBulkEdit}
                    canEditAssignees={canEditAssignees}
                    onAdd={() => {
                        setSocialModalMode('add');
                        setSocialEditRow(null);
                        setSocialVideoModalOpen(true);
                    }}
                    onUploadRow={(row) =>
                        onOpenAttachModal?.({ rowId: row.id, isci: row.isci })
                    }
                    onEditIsciRow={(row) => setEditIsciRow(row)}
                    isEditLineDisabled={(row) =>
                        isOrderLineItemEditDisabled(row, auth.user, userRoles)
                    }
                    canRemoveFromCart={
                        apiSlideoutOrderId
                            ? isMediaTableRowStillInCart
                            : undefined
                    }
                    onRemoveFromCart={
                        apiSlideoutOrderId
                            ? (row) => {
                                  void removeOrderItemFromCart(Number(row.id));
                              }
                            : undefined
                    }
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
                    title="Audio"
                    data={filteredAudioData}
                    cellEditing={sharedRadioCellEditing}
                    editScope="radio"
                    allowEditInactiveRows={canAdminEditInactiveRows}
                    canEditStatus={canEditStatus}
                    orderItemStatusSelectOptions={orderItemStatusSelectOptions}
                    isDeliverableUpdating={isDeliverableUpdating}
                    selectedRowIds={selectedRowIds}
                    onRowSelectToggle={onRowSelectToggle}
                    onBulkEditDueDateDoubleClick={openDueDateBulkEdit}
                    onBulkEditAssignedDoubleClick={openAssignedBulkEdit}
                    canEditAssignees={canEditAssignees}
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
                    isEditLineDisabled={(row) =>
                        isOrderLineItemEditDisabled(row, auth.user, userRoles)
                    }
                    canRemoveFromCart={
                        apiSlideoutOrderId
                            ? isMediaTableRowStillInCart
                            : undefined
                    }
                    onRemoveFromCart={
                        apiSlideoutOrderId
                            ? (row) => {
                                  void removeOrderItemFromCart(Number(row.id));
                              }
                            : undefined
                    }
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
                    allowEditInactiveRows={canAdminEditInactiveRows}
                    orderItemStatusSelectOptions={orderItemStatusSelectOptions}
                    isDeliverableUpdating={isDeliverableUpdating}
                    artPackageTypeSelectOptions={artPackageTypeSelectOptions}
                    selectedRowIds={selectedRowIds}
                    onRowSelectToggle={onRowSelectToggle}
                    onBulkEditDueDateDoubleClick={openDueDateBulkEdit}
                    onBulkEditAssignedDoubleClick={openAssignedBulkEdit}
                    canEditAssignees={canEditAssignees}
                    onPreviewImageClick={openStaticImagePreview}
                    cellEditing={{
                        onCellChange: createArtCellChangeHandler(
                            handleStaticCellChange,
                            patchStaticRowFields,
                        ),
                        onCellDoubleClick: (
                            itemId: string | number,
                            field: string,
                            scope?: string,
                        ) =>
                            handleCellDoubleClickWithOriginal(
                                localStaticRows,
                                handleStaticCellDoubleClick,
                                itemId,
                                field,
                                scope,
                            ),
                        onCellBlur: () => {
                            void handleTableCellBlurWithPersist('static');
                        },
                        onCellKeyDown: handleTableCellKeyDownWithPersist(
                            'static',
                            handleStaticCellKeyDown,
                        ),
                        isCellEditing: isStaticCellEditing,
                    }}
                    onAdd={() => setKeyArtModalOpen(true)}
                />
            </div>

            {!openOrder?.is_demo ? (
                <>
                    <SectionContainers title="New Order">
                        <CartBillingTable
                            cartLines={cartLines}
                            cartTotal={cartTotal}
                        />
                    </SectionContainers>

                    <div className="flex justify-center gap-1 rounded-lg border bg-gray-50 px-1 py-0.5">
                        <Button
                            className="h-[36px]"
                            variant="outline"
                            size="md"
                            disabled={
                                !hasCartItems ||
                                isSubmittingOrder ||
                                isClearingCart
                            }
                            onClick={() => setClearCartModalOpen(true)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="h-[36px]"
                            variant="destructive"
                            size="md"
                            disabled={
                                isSubmittingOrder ||
                                isClearingCart ||
                                !openOrder ||
                                !hasCartItems
                            }
                            aria-busy={isSubmittingOrder}
                            onClick={() => {
                                void handleSubmitOrder();
                            }}
                        >
                            {isSubmittingOrder ? (
                                <LoadingDots />
                            ) : (
                                'Submit Order'
                            )}
                        </Button>
                    </div>

                    <SectionContainers title="Billing Invoices">
                        <InvoiceBillingTable
                            invoices={orderInvoicesForOpenOrder}
                        />
                    </SectionContainers>
                </>
            ) : null}

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
                onClose={() => {
                    setAssignedModalOpen(false);
                    setAssigneeSaveError(undefined);
                }}
                initialAssigned={assignedSeed}
                onSave={handleAssignedBulkSave}
                saveError={assigneeSaveError}
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
                onAdd={handleBroadcastAdd}
                blueprint={broadcastMenuItem?.form_blueprint ?? undefined}
                fieldErrors={broadcastFieldErrors}
                catalogLoading={orderCatalogLoading}
                existingBroadcastRows={existingBroadcastRows}
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
                onAdd={handleSocialAdd}
                fieldErrors={socialFieldErrors}
                existingSocialRows={existingSocialRows}
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
                onAdd={handleRadioAdd}
                fieldErrors={radioFieldErrors}
                existingRadioRows={existingRadioRows}
                venue_item_language={slideout.venue_item_language}
            />
            <AddKeyArtStaticAssetsModal
                isOpen={keyArtModalOpen}
                onClose={() => setKeyArtModalOpen(false)}
                onAdd={handleKeyArtAdd}
                isUSOrder={
                    orderItem?.venue ? orderItem.venue.country_id === 1 : true
                }
            />
            <RevisionRequestModal
                isOpen={revisionModalOpen}
                onClose={() => {
                    setRevisionModalOpen(false);
                    setRevisionTargetRow(null);
                    setRevisionTableName('');
                }}
                onSubmit={(revisionMessage) => {
                    if (revisionTargetRow) {
                        return handleRevisionSubmit(
                            revisionMessage,
                            revisionTargetRow,
                            revisionTableName,
                        );
                    }
                }}
            />
            <ClearCartConfirmModal
                isOpen={clearCartModalOpen}
                onClose={() => setClearCartModalOpen(false)}
                onConfirm={handleClearCart}
                isClearing={isClearingCart}
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
                useAudioPlaceholder={false}
                allowPlaceholder={false}
                label={
                    videoPreviewRow
                        ? `${videoPreviewRow.isci} – ${videoPreviewRow.cutName}`
                        : undefined
                }
                clientReviewActions={
                    videoPreviewRow?.status === 'Client Review' &&
                    canApproveOrderItemDeliverable(
                        auth.user,
                        videoPreviewRow,
                        userRoles,
                    )
                }
                clientReviewUpdating={
                    videoPreviewRow
                        ? isDeliverableUpdating(videoPreviewRow.id)
                        : false
                }
                onClientReviewApprove={
                    videoPreviewRow
                        ? () => {
                              void handleApproveDeliverable(
                                  videoPreviewRow,
                              ).then((ok) => {
                                  if (ok) {
                                      setVideoPlayerModalOpen(false);
                                      setVideoPreviewRow(null);
                                      setVideoPreviewTableTitle('');
                                  }
                              });
                          }
                        : undefined
                }
            />
        </>
    );
}

export default GeneralMediaView;
