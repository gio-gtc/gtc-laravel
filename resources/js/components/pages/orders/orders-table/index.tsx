import { useContainedSheetOpen } from '@/components/ui/sheet';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useOrderSlideoutCatalog } from '@/contexts/order-slideout-catalog-context';
import { useOrdersCatalog } from '@/contexts/orders-catalog-context';
import { useOrdersFilterUsers } from '@/hooks/use-orders-filter-users';
import { useOrdersFilters } from '@/hooks/use-orders-filters';
import { useRecentOrders } from '@/hooks/use-recent-orders';
import {
    useInfiniteScrollTrigger,
    useTourFeed,
    useTourOrdersCache,
} from '@/hooks/use-orders-tours';
import { useOrdersPageFlashSync } from '@/hooks/use-orders-page-flash-sync';
import { formatShortUsDate } from '@/lib/format/date';
import {
    buildFilterCacheKey,
    hasRegionalFilter,
    ordersFilterStateToGlobalFilters,
} from '@/lib/orders/global-dashboard-filters';
import { getVisibleIndexOrderDemoContext } from '@/lib/orders/index-order-helpers';
import { resolveUrl } from '@/lib/utils';
import { orders } from '@/routes';
import { type SharedData } from '@/types';
import { type OrdersPageProps } from '@/types/inertia-pages';
import type { GlobalDashboardFilters, OrderStatus } from '@/types/orders-api';
import { router, usePage } from '@inertiajs/react';
import {
    Fragment,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import AddOrderModal, { type AddOrderModalTour } from '../add-order-modal';
import OrdersTableHeaderActions from '../orders-table-header-actions';
import OrderDetailSlideout from '../slideout';
import OrdersTableDemoRow from './orders-table-demo-row';
import OrdersTableOrderRow from './orders-table-order-row';
import OrdersTableTourHeaderRow from './orders-table-tour-header-row';

function OrdersTable() {
    const page = usePage<SharedData & OrdersPageProps>();
    const catalog = useOrdersCatalog();
    const {
        openOrder,
        setOpenOrder,
        openOrderById,
        loadingOrderId,
        legacyTour,
        legacyVenueItem,
        updateOpenOrder,
        registerTourOrdersInvalidator,
    } = useOrderSlideoutCatalog();
    const {
        clientUsers,
        collaboratorUsers,
        staffRosterLoaded,
        loadStaffRoster,
    } = useOrdersFilterUsers();
    const validStatusValues = useMemo(
        () => catalog.order_status_options.map((o) => o.value) as OrderStatus[],
        [catalog.order_status_options],
    );
    const [filters, setFilters] = useOrdersFilters(
        validStatusValues,
        collaboratorUsers,
        staffRosterLoaded,
    );

    useEffect(() => {
        loadStaffRoster();
    }, [loadStaffRoster]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
    const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);
    const filterKeyRef = useRef<string | null>(null);
    const lastUrlOpenOrderId = useRef<number | null>(null);

    const buildOrdersPageUrl = useCallback((params: URLSearchParams) => {
        const query = params.toString();
        return query
            ? `${resolveUrl(orders())}?${query}`
            : resolveUrl(orders());
    }, []);

    const globalFilters = useMemo(
        (): GlobalDashboardFilters =>
            ordersFilterStateToGlobalFilters(filters, {
                search: searchQuery,
                url: page.url,
            }),
        [filters, searchQuery, page.url],
    );

    const {
        tours,
        isLoadingMore,
        isResetting,
        loadError,
        loadNextPage,
        resetFeed,
        hasMore,
        clearLoadError,
    } = useTourFeed(catalog.tours, catalog.tours_pagination);

    const {
        tourAccordionState,
        getTourOrders,
        toggleTourExpansion,
        expandTour,
        loadTourOrders,
        reloadTour,
        clearCache,
    } = useTourOrdersCache(globalFilters);

    const slideoutOpen = useContainedSheetOpen(
        openOrder !== null || loadingOrderId !== null,
    );
    const { addRecentOrder } = useRecentOrders();

    const revealTourOrder = useCallback(
        (tourId: number, orderId: number) => {
            expandTour(tourId, { force: true });
            setSelectedOrderIds([orderId]);
        },
        [expandTour],
    );

    useOrdersPageFlashSync({ revealTourOrder });

    const handleCloseSlideout = useCallback(() => {
        setOpenOrder(null);
        const queryIndex = page.url.indexOf('?');
        if (queryIndex < 0) {
            return;
        }
        const params = new URLSearchParams(page.url.slice(queryIndex));
        if (!params.has('openOrder')) {
            return;
        }
        params.delete('openOrder');
        router.visit(buildOrdersPageUrl(params), {
            preserveState: true,
            replace: true,
        });
    }, [buildOrdersPageUrl, page.url, setOpenOrder]);

    const applyGlobalFilterReset = useCallback(
        (nextFilters: GlobalDashboardFilters) => {
            clearCache();
            setOpenOrder(null);
            void resetFeed(nextFilters);
        },
        [clearCache, resetFeed, setOpenOrder],
    );

    useEffect(() => {
        registerTourOrdersInvalidator((tourId) => {
            void reloadTour(tourId);
        });
    }, [registerTourOrdersInvalidator, reloadTour]);

    useEffect(() => {
        const nextKey = buildFilterCacheKey(globalFilters);

        if (filterKeyRef.current === null) {
            filterKeyRef.current = nextKey;
            if (nextKey.length > 0) {
                applyGlobalFilterReset(globalFilters);
            }
            return;
        }

        if (nextKey === filterKeyRef.current) {
            return;
        }

        filterKeyRef.current = nextKey;
        applyGlobalFilterReset(globalFilters);
    }, [globalFilters, applyGlobalFilterReset]);

    useEffect(() => {
        const queryIndex = page.url.indexOf('?');
        const params = new URLSearchParams(
            queryIndex >= 0 ? page.url.slice(queryIndex) : '',
        );
        const filter = params.get('filter');
        const shouldShowMyTasks = filter === 'my-tasks';
        setFilters((prev) =>
            prev.myCollaborators !== shouldShowMyTasks
                ? { ...prev, myCollaborators: shouldShowMyTasks }
                : prev,
        );
    }, [page.url, setFilters]);

    useEffect(() => {
        const queryIndex = page.url.indexOf('?');
        const params = new URLSearchParams(
            queryIndex >= 0 ? page.url.slice(queryIndex) : '',
        );
        const openOrderId = params.get('openOrder');

        if (!openOrderId) {
            lastUrlOpenOrderId.current = null;
            return;
        }

        const id = Number(openOrderId);
        if (Number.isNaN(id)) {
            return;
        }

        if (lastUrlOpenOrderId.current === id) {
            return;
        }

        lastUrlOpenOrderId.current = id;

        void (async () => {
            const order = await openOrderById(id);
            if (!order || lastUrlOpenOrderId.current !== id) {
                return;
            }

            expandTour(order.tour_id, { force: true });
            setSelectedOrderIds([id]);
            addRecentOrder({
                orderId: order.id,
                uuid: order.uuid,
                tourName: tours.find((t) => t.id === order.tour_id)?.name ?? '',
                venueName: order.is_demo ? 'Demo' : (order.venue?.name ?? ''),
            });
        })();
    }, [page.url, openOrderById, expandTour, addRecentOrder, tours]);

    const handleFilterChange = useCallback(
        (newFilters: typeof filters) => {
            setFilters(newFilters);
            if (newFilters.myCollaborators !== filters.myCollaborators) {
                const queryIndex = page.url.indexOf('?');
                const params = new URLSearchParams(
                    queryIndex >= 0 ? page.url.slice(queryIndex) : '',
                );
                if (newFilters.myCollaborators) {
                    params.set('filter', 'my-tasks');
                } else {
                    params.delete('filter');
                }
                const url = buildOrdersPageUrl(params);
                router.visit(url, { preserveState: true });
            }
        },
        [buildOrdersPageUrl, filters.myCollaborators, page.url, setFilters],
    );

    const handleToggleTourExpansion = useCallback(
        (tourId: number) => {
            const wasExpanded = tourAccordionState[tourId]?.isExpanded ?? false;

            toggleTourExpansion(tourId);

            if (wasExpanded) {
                const orderIds =
                    getTourOrders(tourId)?.map((order) => order.id) ?? [];
                setSelectedOrderIds((prevSelected) =>
                    prevSelected.filter((id) => !orderIds.includes(id)),
                );
            }
        },
        [getTourOrders, toggleTourExpansion, tourAccordionState],
    );

    const handleOrderRowSelect = (orderId: number) => {
        setSelectedOrderIds((prev) => {
            if (prev.includes(orderId)) {
                return [];
            }
            return [orderId];
        });
    };

    const handleOpenSlideout = useCallback(
        async (orderId: number) => {
            const order = await openOrderById(orderId);
            if (!order) {
                return;
            }
            addRecentOrder({
                orderId: order.id,
                uuid: order.uuid,
                tourName: tours.find((t) => t.id === order.tour_id)?.name ?? '',
                venueName: order.is_demo ? 'Demo' : (order.venue?.name ?? ''),
            });
        },
        [openOrderById, addRecentOrder, tours],
    );

    const selectedTourForModal = useMemo((): AddOrderModalTour | null => {
        if (selectedOrderIds.length === 0) return null;
        const orderId = selectedOrderIds[0];
        for (const tour of tours) {
            const ordersForTour = getTourOrders(tour.id) ?? [];
            if (ordersForTour.some((o) => o.id === orderId)) {
                return { id: tour.id, name: tour.name };
            }
        }
        return null;
    }, [selectedOrderIds, tours, getTourOrders]);

    const sentinelRef = useInfiniteScrollTrigger(
        loadNextPage,
        hasMore && !isLoadingMore && !isResetting,
    );

    const regionalFilterActive = hasRegionalFilter(filters);

    return (
        <div className="table-content-max-width space-y-4">
            <OrdersTableHeaderActions
                selectedOrderCount={selectedOrderIds.length}
                onAddOrderClick={() => setIsAddOrderModalOpen(true)}
                filters={filters}
                onFilterChange={handleFilterChange}
                onSearchChange={setSearchQuery}
            />

            <div className="border-t">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-full max-w-[20%]">
                                Name
                            </TableHead>
                            <TableHead className="w-full max-w-[35%]">
                                Venue
                            </TableHead>
                            <TableHead className="w-full max-w-[10%]">
                                Due Date
                            </TableHead>
                            <TableHead className="w-full max-w-[11%]">
                                Client
                            </TableHead>
                            <TableHead className="w-full max-w-[12%]">
                                Collaborators
                            </TableHead>
                            <TableHead className="w-full max-w-[12%]">
                                Status
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tours.length > 0 ? (
                            tours.map((tour) => {
                                const tourEntry = tourAccordionState[tour.id];
                                const isExpanded =
                                    tourEntry?.isExpanded ?? false;
                                const tourOrders = tourEntry?.orders;
                                const isLoadingTour =
                                    tourEntry?.isLoading ?? false;
                                const tourError = tourEntry?.error;
                                const demoOrder =
                                    tourOrders &&
                                    getVisibleIndexOrderDemoContext(
                                        tourOrders,
                                        regionalFilterActive,
                                    );
                                const liveOrders =
                                    tourOrders?.filter((o) => !o.is_demo) ?? [];

                                return (
                                    <Fragment key={`order-group-${tour.id}`}>
                                        <OrdersTableTourHeaderRow
                                            tour={tour}
                                            isExpanded={isExpanded}
                                            onToggle={() =>
                                                handleToggleTourExpansion(
                                                    tour.id,
                                                )
                                            }
                                        />

                                        {isExpanded && isLoadingTour && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={6}
                                                    className="py-4 text-center text-sm text-muted-foreground"
                                                >
                                                    Loading orders…
                                                </TableCell>
                                            </TableRow>
                                        )}

                                        {isExpanded && tourError && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={6}
                                                    className="py-4 text-center"
                                                >
                                                    <button
                                                        type="button"
                                                        className="text-sm text-red-600 underline"
                                                        onClick={() =>
                                                            void loadTourOrders(
                                                                tour.id,
                                                                true,
                                                            )
                                                        }
                                                    >
                                                        {tourError} Click to
                                                        retry.
                                                    </button>
                                                </TableCell>
                                            </TableRow>
                                        )}

                                        {isExpanded &&
                                            demoOrder &&
                                            !isLoadingTour && (
                                                <OrdersTableDemoRow
                                                    demoOrder={demoOrder}
                                                    orderIsSelected={selectedOrderIds.includes(
                                                        demoOrder.id,
                                                    )}
                                                    collaboratorRoster={
                                                        collaboratorUsers
                                                    }
                                                    onOrderRowSelect={
                                                        handleOrderRowSelect
                                                    }
                                                    onOpenSlideout={
                                                        handleOpenSlideout
                                                    }
                                                />
                                            )}

                                        {isExpanded &&
                                            !isLoadingTour &&
                                            liveOrders.map((order) => (
                                                <OrdersTableOrderRow
                                                    key={`order-${order.id}`}
                                                    order={order}
                                                    orderIsSelected={selectedOrderIds.includes(
                                                        order.id,
                                                    )}
                                                    clientRoster={clientUsers}
                                                    collaboratorRoster={
                                                        collaboratorUsers
                                                    }
                                                    formatDate={
                                                        formatShortUsDate
                                                    }
                                                    onOrderRowSelect={
                                                        handleOrderRowSelect
                                                    }
                                                    onOpenSlideout={
                                                        handleOpenSlideout
                                                    }
                                                />
                                            ))}
                                    </Fragment>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    {isResetting
                                        ? 'Loading tours…'
                                        : 'No tours found.'}
                                </TableCell>
                            </TableRow>
                        )}

                        {loadError && (
                            <TableRow>
                                <TableCell colSpan={6} className="py-3">
                                    <button
                                        type="button"
                                        className="w-full text-center text-sm text-red-600 underline"
                                        onClick={() => {
                                            clearLoadError();
                                            void loadNextPage();
                                        }}
                                    >
                                        {loadError}
                                    </button>
                                </TableCell>
                            </TableRow>
                        )}

                        {hasMore && (
                            <TableRow ref={sentinelRef}>
                                <TableCell
                                    colSpan={6}
                                    className="h-8 text-center text-xs text-muted-foreground"
                                >
                                    {isLoadingMore
                                        ? 'Loading more tours…'
                                        : null}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <AddOrderModal
                isOpen={isAddOrderModalOpen}
                onClose={() => setIsAddOrderModalOpen(false)}
                tour={selectedTourForModal}
            />

            <OrderDetailSlideout
                order={legacyTour}
                orderItem={legacyVenueItem}
                apiOrder={openOrder}
                onOrderSaved={updateOpenOrder}
                isOpen={slideoutOpen}
                isLoading={loadingOrderId !== null && openOrder === null}
                onClose={handleCloseSlideout}
            />
        </div>
    );
}

export default OrdersTable;
