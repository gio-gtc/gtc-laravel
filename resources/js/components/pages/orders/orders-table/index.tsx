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
import { useOrdersCatalog } from '@/contexts/orders-catalog-context';
import { useOrdersFilterUsers } from '@/hooks/use-orders-filter-users';
import { useOrdersFilters } from '@/hooks/use-orders-filters';
import {
    getAssigneesForOrder,
    orderMatchesClientFilter,
    orderMatchesCollaboratorFilter,
    resolveClientForOrder,
} from '@/lib/orders/order-assignees';
import { cn, resolveUrl } from '@/lib/utils';
import { orders } from '@/routes';
import {
    type SharedData,
    type Tour,
    type TourVenue,
    type User,
    type Venue,
} from '@/types';
import { type OrdersPageProps } from '@/types/inertia-pages';
import type { ApiOrder, GroupedOrders, OrderItemStatus } from '@/types/orders-api';
import { router, usePage } from '@inertiajs/react';
import {
    Fragment,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import AddOrderModal, {
    type AddOrderModalTour,
} from '../add-order-modal';
import OrdersTableHeaderActions from '../orders-table-header-actions';
import VenueDetailSlideout from '../slideout';
import { getVisibleOrderDemoContext } from './orders-table-group-helpers';
import OrdersTableDemoRow from './orders-table-demo-row';
import OrdersTableOrderRow from './orders-table-order-row';

const USA_COUNTRY_ID = 1;

function OrdersTable() {
    const page = usePage<SharedData & OrdersPageProps>();
    const { auth } = page.props;
    const catalog = useOrdersCatalog();
    const { clientUsers, collaboratorUsers } = useOrdersFilterUsers();
    const validStatusValues = useMemo(
        () =>
            catalog.order_status_options.map((o) => o.value) as OrderItemStatus[],
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
    const [selectedSlideout, setSelectedSlideout] = useState<{
        order: Tour;
        venueItem: {
            orderVenue: TourVenue;
            venue: Venue | null;
        } | null;
    } | null>(null);

    const slideoutOpen = useContainedSheetOpen(selectedSlideout !== null);

    const groupedData = catalog.grouped_orders;

    const getOrderAssignees = useCallback(
        (order: ApiOrder): User[] =>
            getAssigneesForOrder(order, collaboratorUsers),
        [collaboratorUsers],
    );

    // Sync URL filter param to myCollaborators (e.g. ?filter=my-tasks)
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

    const filteredGroupedData = useMemo((): GroupedOrders[] => {
        let searchFiltered: GroupedOrders[];

        if (!searchQuery.trim()) {
            searchFiltered = groupedData;
        } else {
            const query = searchQuery.toLowerCase().trim();

            const orderMatchesSearch = (order: ApiOrder): boolean => {
                if (order.is_demo) {
                    const assignees = getAssigneesForOrder(
                        order,
                        collaboratorUsers,
                    );
                    return (
                        'demo'.includes(query) ||
                        assignees.some((a) =>
                            a.name.toLowerCase().includes(query),
                        )
                    );
                }

                const venue = order.venue;
                const region = venue
                    ? `${venue.city ?? ''}, ${venue.state ?? ''}`
                    : '';
                const clientName =
                    resolveClientForOrder(order, clientUsers)?.name
                        ?.toLowerCase() ?? '';
                const assignees = getAssigneesForOrder(
                    order,
                    collaboratorUsers,
                );

                return (
                    region.toLowerCase().includes(query) ||
                    (venue?.name?.toLowerCase().includes(query) ?? false) ||
                    clientName.includes(query) ||
                    assignees.some((a) => a.name.toLowerCase().includes(query))
                );
            };

            const hasTourMatch = groupedData.some((g) =>
                g.tour.name.toLowerCase().includes(query),
            );

            if (hasTourMatch) {
                searchFiltered = groupedData.filter((g) =>
                    g.tour.name.toLowerCase().includes(query),
                );
            } else {
                searchFiltered = groupedData
                    .filter((g) => g.orders.some(orderMatchesSearch))
                    .map((g) => ({
                        ...g,
                        orders: g.orders.filter(orderMatchesSearch),
                    }));
            }
        }

        const hasClientFilter = filters.clientIds.length > 0;
        const hasCollaboratorFilter =
            filters.collaboratorIds.length > 0 || filters.myCollaborators;
        const hasStatusFilter = filters.statuses.length > 0;
        const hasCountryFilter =
            !filters.country.us || !filters.country.international;

        const orderMatchesAdvancedFilters = (order: ApiOrder): boolean => {
            if (order.is_demo) {
                if (hasClientFilter || hasCountryFilter) return false;
            } else {
                if (
                    hasClientFilter &&
                    !orderMatchesClientFilter(order, filters.clientIds)
                ) {
                    return false;
                }

                if (hasCountryFilter && order.venue) {
                    const isUS = order.venue.country_id === USA_COUNTRY_ID;
                    const usMatch = filters.country.us && isUS;
                    const internationalMatch =
                        filters.country.international && !isUS;
                    if (!usMatch && !internationalMatch) return false;
                }
            }

            if (hasCollaboratorFilter) {
                if (
                    !orderMatchesCollaboratorFilter(
                        order,
                        collaboratorUsers,
                        {
                            myCollaborators: filters.myCollaborators,
                            collaboratorIds: filters.collaboratorIds,
                            authUserId: auth.user.id,
                        },
                    )
                ) {
                    return false;
                }
            }

            if (hasStatusFilter && !filters.statuses.includes(order.status)) {
                return false;
            }

            return true;
        };

        if (
            !hasClientFilter &&
            !hasCollaboratorFilter &&
            !hasStatusFilter &&
            !hasCountryFilter
        ) {
            return searchFiltered;
        }

        return searchFiltered
            .filter((g) => g.orders.some(orderMatchesAdvancedFilters))
            .map((g) => ({
                ...g,
                orders: g.orders.filter(orderMatchesAdvancedFilters),
            }));
    }, [
        groupedData,
        searchQuery,
        filters,
        auth.user.id,
        clientUsers,
        collaboratorUsers,
    ]);

    const hasOrderLevelFilter =
        filters.statuses.length > 0 ||
        !filters.country.us ||
        !filters.country.international;

    const hasClientFilter = filters.clientIds.length > 0;
    const hasCollaboratorFilter =
        filters.collaboratorIds.length > 0 || filters.myCollaborators;

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    const toggleTourExpansion = (tourId: number) => {
        setExpandedTours((prev) => {
            const newSet = new Set(prev);
            const isCurrentlyExpanded = newSet.has(tourId);

            if (isCurrentlyExpanded) {
                newSet.delete(tourId);
                setSelectedOrderIds((prevSelected) => {
                    const orderIdsForTour = groupedData
                        .find((g) => g.tour.id === tourId)
                        ?.orders.map((o) => o.id) ?? [];
                    return prevSelected.filter(
                        (id) => !orderIdsForTour.includes(id),
                    );
                });
            } else {
                newSet.add(tourId);
            }
            return newSet;
        });
    };

    const handleOrderRowClick = (orderId: number) => {
        setSelectedOrderIds((prev) => {
            if (prev.includes(orderId)) {
                return [];
            }
            return [orderId];
        });
    };

    const selectedTourForModal = useMemo((): AddOrderModalTour | null => {
        if (selectedOrderIds.length === 0) return null;
        const orderId = selectedOrderIds[0];
        for (const group of groupedData) {
            const order = group.orders.find((o) => o.id === orderId);
            if (order) {
                return { id: group.tour.id, name: group.tour.name };
            }
        }
        return null;
    }, [selectedOrderIds, groupedData]);

    return (
        <div className="table-content-max-width space-y-4">
            <OrdersTableHeaderActions
                selectedOrderCount={selectedOrderIds.length}
                onAddOrderClick={() => setIsAddOrderModalOpen(true)}
                filters={filters}
                onFilterChange={handleFilterChange}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                groupedData={groupedData}
                clientUsers={clientUsers}
                getOrderAssignees={getOrderAssignees}
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
                        {filteredGroupedData.length > 0 ? (
                            filteredGroupedData.map((group) => {
                                const isExpanded = expandedTours.has(
                                    group.tour.id,
                                );
                                const demoCtx =
                                    isExpanded && !hasOrderLevelFilter
                                        ? getVisibleOrderDemoContext(group, {
                                              hasOrderLevelFilter,
                                              hasClientFilter,
                                              hasCollaboratorFilter,
                                              filters,
                                              authUserId: auth.user.id,
                                              searchQuery,
                                              collaboratorRoster:
                                                  collaboratorUsers,
                                          })
                                        : null;
                                const liveOrders = group.orders.filter(
                                    (o) => !o.is_demo,
                                );

                                return (
                                    <Fragment
                                        key={`order-group-${group.tour.id}`}
                                    >
                                        <TableRow
                                            className="cursor-pointer text-lg font-semibold hover:bg-muted/50"
                                            onClick={() =>
                                                toggleTourExpansion(
                                                    group.tour.id,
                                                )
                                            }
                                        >
                                            <TableCell
                                                colSpan={6}
                                                className="h-[45px] px-2 py-1"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <FilledArrow
                                                        className={cn(
                                                            'text-gray-600translate-x-4 size-1.5 rotate-[-90deg] transition-transform duration-150',
                                                            isExpanded &&
                                                                'rotate-0',
                                                        )}
                                                    />
                                                    <span className="text-gray-700">
                                                        {group.tour.name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>

                                        {demoCtx && (
                                            <OrdersTableDemoRow
                                                demoOrder={demoCtx.demoOrder}
                                                collaboratorRoster={
                                                    collaboratorUsers
                                                }
                                            />
                                        )}

                                        {isExpanded &&
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
                                                    formatDate={formatDate}
                                                    onOrderRowClick={
                                                        handleOrderRowClick
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
                                    className="h-24 text-center"
                                />
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

            <VenueDetailSlideout
                venueItem={selectedSlideout?.venueItem ?? null}
                order={selectedSlideout?.order ?? null}
                isOpen={slideoutOpen}
                onClose={() => setSelectedSlideout(null)}
            />
        </div>
    );
}

export default OrdersTable;
