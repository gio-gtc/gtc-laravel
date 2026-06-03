import { FilledArrow } from '@/components/ui/icons';
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
import { useInfiniteScrollTrigger, useTourFeed } from '@/hooks/use-tour-feed';
import { useTourOrdersCache } from '@/hooks/use-tour-orders-cache';
import { formatShortUsDate } from '@/lib/format/date';
import {
    buildFilterCacheKey,
    hasRegionalFilter,
    ordersFilterStateToGlobalFilters,
} from '@/lib/orders/global-dashboard-filters';
import { getVisibleIndexOrderDemoContext } from '@/lib/orders/index-order-helpers';
import { cn, resolveUrl } from '@/lib/utils';
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
        legacyEventDates,
        registerTourOrdersInvalidator,
    } = useOrderSlideoutCatalog();
    const { clientUsers, collaboratorUsers } = useOrdersFilterUsers();
    const validStatusValues = useMemo(
        () => catalog.order_status_options.map((o) => o.value) as OrderStatus[],
        [catalog.order_status_options],
    );
    const [filters, setFilters] = useOrdersFilters(
        validStatusValues,
        clientUsers,
        collaboratorUsers,
    );
    const [expandedTours, setExpandedTours] = useState<Set<number>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
    const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);
    const filterKeyRef = useRef<string | null>(null);
    const deepLinkHandled = useRef(false);

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
        ordersByTour,
        loadingTourIds,
        errorsByTour,
        loadTourOrders,
        reloadTour,
        clearCache,
    } = useTourOrdersCache(globalFilters);

    const slideoutOpen = useContainedSheetOpen(
        openOrder !== null || loadingOrderId !== null,
    );
    const { addRecentOrder } = useRecentOrders();

    const applyGlobalFilterReset = useCallback(
        (nextFilters: GlobalDashboardFilters) => {
            setExpandedTours(new Set());
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
        if (deepLinkHandled.current) {
            return;
        }

        const queryIndex = page.url.indexOf('?');
        const params = new URLSearchParams(
            queryIndex >= 0 ? page.url.slice(queryIndex) : '',
        );
        const openOrderId = params.get('openOrder');
        if (!openOrderId) {
            return;
        }

        const id = Number(openOrderId);
        if (Number.isNaN(id)) {
            return;
        }

        deepLinkHandled.current = true;

        void (async () => {
            const order = await openOrderById(id);
            if (!order) {
                return;
            }

            setExpandedTours((prev) => new Set(prev).add(order.tour_id));
            void loadTourOrders(order.tour_id);
            setSelectedOrderIds([id]);
            addRecentOrder({
                orderId: order.id,
                uuid: order.uuid,
                tourName: tours.find((t) => t.id === order.tour_id)?.name ?? '',
                venueName: order.is_demo ? 'Demo' : (order.venue?.name ?? ''),
            });
        })();
    }, [page.url, openOrderById, loadTourOrders, addRecentOrder, tours]);

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
                const query = params.toString();
                const url = query
                    ? `${resolveUrl(orders())}?${query}`
                    : resolveUrl(orders());
                router.visit(url, { preserveState: true });
            }
        },
        [filters.myCollaborators, page.url, setFilters],
    );

    const toggleTourExpansion = useCallback(
        (tourId: number) => {
            setExpandedTours((prev) => {
                const newSet = new Set(prev);
                const isCurrentlyExpanded = newSet.has(tourId);

                if (isCurrentlyExpanded) {
                    newSet.delete(tourId);
                    setSelectedOrderIds((prevSelected) => {
                        const orderIdsForTour =
                            ordersByTour[tourId]?.map((o) => o.id) ?? [];
                        return prevSelected.filter(
                            (id) => !orderIdsForTour.includes(id),
                        );
                    });
                } else {
                    newSet.add(tourId);
                    void loadTourOrders(tourId);
                }
                return newSet;
            });
        },
        [loadTourOrders, ordersByTour],
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
            const ordersForTour = ordersByTour[tour.id] ?? [];
            if (ordersForTour.some((o) => o.id === orderId)) {
                return { id: tour.id, name: tour.name };
            }
        }
        return null;
    }, [selectedOrderIds, tours, ordersByTour]);

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
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                isSearching={isResetting}
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
                                const isExpanded = expandedTours.has(tour.id);
                                const tourOrders = ordersByTour[tour.id];
                                const isLoadingTour = loadingTourIds.has(
                                    tour.id,
                                );
                                const tourError = errorsByTour[tour.id];
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
                                        <TableRow
                                            className="cursor-pointer text-lg font-semibold hover:bg-muted/50"
                                            onClick={() =>
                                                toggleTourExpansion(tour.id)
                                            }
                                        >
                                            <TableCell
                                                colSpan={6}
                                                className="h-[45px] px-2 py-1"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <FilledArrow
                                                        className={cn(
                                                            'size-1.5 rotate-[-90deg] text-gray-600 transition-transform duration-150',
                                                            isExpanded &&
                                                                'rotate-0',
                                                        )}
                                                    />
                                                    <span className="text-gray-700">
                                                        {tour.name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>

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
                apiEventDates={legacyEventDates}
                apiClient={openOrder?.client ?? null}
                isOpen={slideoutOpen}
                isLoading={loadingOrderId !== null && openOrder === null}
                onClose={() => setOpenOrder(null)}
            />
        </div>
    );
}

export default OrdersTable;
