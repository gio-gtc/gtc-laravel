import { FilledArrow } from '@/components/ui/icons';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    getUniqueAssignedUsersForTourVenue,
    type OrdersVenueLineCatalog,
} from '@/components/utils/venue-items';
import { useOrdersCatalog } from '@/contexts/orders-catalog-context';
import { useOrdersFilters } from '@/hooks/use-orders-filters';
import { useRecentOrders } from '@/hooks/use-recent-orders';
import { useUsersWithFallback } from '@/hooks/use-users-with-fallback';
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
import { router, usePage } from '@inertiajs/react';
import {
    Fragment,
    startTransition,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import AddVenueModal from '../add-venue-modal';
import OrdersTableHeaderActions, {
    type GroupedOrderData,
} from '../orders-table-header-actions';
import VenueDetailSlideout from '../slideout';
import OrdersTableDemoRow from './orders-table-demo-row';
import {
    getVisibleOrderDemoContext,
    sortVenueStopsByCreatedDesc,
} from './orders-table-group-helpers';
import OrdersTableVenueRow from './orders-table-venue-row';

function OrdersTable() {
    const page = usePage<SharedData & OrdersPageProps>();
    const { auth } = page.props;
    const catalog = useOrdersCatalog();
    const tourVenueStatusIds = useMemo(
        () => catalog.tour_venue_status.map((r) => r.id),
        [catalog.tour_venue_status],
    );
    const [filters, setFilters] = useOrdersFilters(tourVenueStatusIds);
    const { addRecentOrder } = useRecentOrders();
    const [expandedOrders, setExpandedOrders] = useState<Set<number>>(
        new Set(),
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedVenueIds, setSelectedVenueIds] = useState<number[]>([]);
    const [isAddVenueModalOpen, setIsAddVenueModalOpen] = useState(false);
    const [selectedSlideout, setSelectedSlideout] = useState<{
        order: Tour;
        venueItem: {
            orderVenue: TourVenue;
            venue: Venue | null;
        } | null;
    } | null>(null);
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

    // Transform data: merge venue stops + optional tour demo (same per-tour order as flat tourVenueData).
    const groupedData = useMemo<GroupedOrderData[]>(() => {
        return catalog.tours
            .map((order) => {
                const stopItems = catalog.tour_venue_stops
                    .filter((ov) => ov.tour_id === order.id)
                    .map((ov) => ({
                        orderVenue: ov,
                        venue: catalog.venues.find(
                            (v) => v.id === ov.venue_id,
                        ) as Venue | null,
                    }));
                const demo = catalog.tour_demo_venues.find(
                    (d) => d.tour_id === order.id,
                );
                const demoItem = demo
                    ? [{ orderVenue: demo, venue: null as Venue | null }]
                    : [];
                const venues = [...stopItems, ...demoItem].filter(
                    (item) => item.venue !== undefined || item.venue === null,
                );
                return { order, venues };
            })
            .sort((a, b) => {
                const aTime = new Date(a.order.created_at).getTime();
                const bTime = new Date(b.order.created_at).getTime();
                return bTime - aTime; // descending (newest first)
            });
    }, [
        catalog.tours,
        catalog.tour_venue_stops,
        catalog.tour_demo_venues,
        catalog.venues,
    ]);

    const getTourVenueAssignees = useMemo(() => {
        return (tourVenueId: number): User[] =>
            getUniqueAssignedUsersForTourVenue(
                tourVenueId,
                usersWithFallback,
                venueLineCatalog,
            );
    }, [usersWithFallback, venueLineCatalog]);

    // Helper function to get client user by ID
    const getClientUser = useMemo(() => {
        return (clientId: number): User | undefined => {
            return usersWithFallback.find((user) => user.id === clientId);
        };
    }, [usersWithFallback]);

    // Record venue to recent list when slideout is opened (including demo)
    useEffect(() => {
        if (selectedSlideout?.venueItem) {
            addRecentOrder({
                tourVenueId: selectedSlideout.venueItem.orderVenue.id,
                tourName: selectedSlideout.order.name,
                venueName: selectedSlideout.venueItem.venue?.name ?? 'Demo',
            });
        }
    }, [selectedSlideout, addRecentOrder]);

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

    // Sync myCollaborators filter changes to URL (filters → URL)
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

    // Open venue slideout from URL param (e.g. from Recent Orders sidebar link)
    useEffect(() => {
        const url = page.url;
        const queryIndex = url.indexOf('?');
        if (queryIndex === -1) return;
        const params = new URLSearchParams(url.slice(queryIndex));
        const openVenueId = params.get('openVenue');
        if (!openVenueId) return;

        const tourVenueId = parseInt(openVenueId, 10);
        if (Number.isNaN(tourVenueId)) return;

        for (const group of groupedData) {
            const venueItem = group.venues.find(
                (v) => v.orderVenue.id === tourVenueId,
            );
            if (venueItem) {
                startTransition(() => {
                    setSelectedSlideout({
                        order: group.order,
                        venueItem: {
                            orderVenue: venueItem.orderVenue,
                            venue: venueItem.venue,
                        },
                    });
                });
                // Preserve filter param (e.g. my-tasks) when clearing openVenue
                const params = new URLSearchParams(
                    queryIndex >= 0 ? url.slice(queryIndex) : '',
                );
                params.delete('openVenue');
                const baseUrl = resolveUrl(orders());
                const visitUrl = params.toString()
                    ? `${baseUrl}?${params.toString()}`
                    : baseUrl;
                router.visit(visitUrl, {
                    replace: true,
                    preserveState: true,
                });
                break;
            }
        }
    }, [page.url, groupedData]);

    // Filter grouped data by search query, then by advanced filters
    const filteredGroupedData = useMemo(() => {
        // Step 1: Search filter
        let searchFiltered: GroupedOrderData[];
        if (!searchQuery.trim()) {
            searchFiltered = groupedData;
        } else {
            const query = searchQuery.toLowerCase().trim();
            const venueMatchesSearch = (venueItem: {
                orderVenue: TourVenue;
                venue: Venue | null;
            }) => {
                if (venueItem.venue == null) {
                    const client = getClientUser(venueItem.orderVenue.client);
                    const assignees = getTourVenueAssignees(
                        venueItem.orderVenue.id,
                    );
                    return (
                        'demo'.includes(query) ||
                        (client?.name?.toLowerCase().includes(query) ??
                            false) ||
                        assignees.some((c) =>
                            c.name.toLowerCase().includes(query),
                        )
                    );
                }
                const region = `${venueItem.venue.city}, ${venueItem.venue.state}`;
                const client = getClientUser(venueItem.orderVenue.client);
                const assignees = getTourVenueAssignees(
                    venueItem.orderVenue.id,
                );
                return (
                    region.toLowerCase().includes(query) ||
                    venueItem.venue.name.toLowerCase().includes(query) ||
                    (client?.name?.toLowerCase().includes(query) ?? false) ||
                    assignees.some((c) => c.name.toLowerCase().includes(query))
                );
            };
            const hasTourMatch = groupedData.some((g) =>
                g.order.name.toLowerCase().includes(query),
            );
            if (hasTourMatch) {
                searchFiltered = groupedData.filter((g) =>
                    g.order.name.toLowerCase().includes(query),
                );
            } else {
                searchFiltered = groupedData
                    .filter((g) => g.venues.some(venueMatchesSearch))
                    .map((g) => ({
                        ...g,
                        venues: g.venues.filter(venueMatchesSearch),
                    }));
            }
        }

        // Step 2: Apply advanced filters (client, collaborator, status, country)
        const hasClientFilter =
            filters.clientIds.length > 0 || filters.myClients;
        const hasCollaboratorFilter =
            filters.collaboratorIds.length > 0 || filters.myCollaborators;
        const hasStatusFilter = filters.statuses.length > 0;
        const hasCountryFilter =
            !filters.country.us || !filters.country.international;

        const venueMatchesAdvancedFilters = (venueItem: {
            orderVenue: TourVenue;
            venue: Venue | null;
        }): boolean => {
            const isDemo = venueItem.venue == null;

            // Client filter (when myClients, ignore clientIds per plan)
            if (hasClientFilter) {
                if (filters.myClients) {
                    if (venueItem.orderVenue.client !== auth.user.id)
                        return false;
                } else {
                    if (
                        !filters.clientIds.includes(venueItem.orderVenue.client)
                    )
                        return false;
                }
            }

            if (hasCollaboratorFilter) {
                const assignees = getTourVenueAssignees(
                    venueItem.orderVenue.id,
                );
                if (filters.myCollaborators) {
                    if (!assignees.some((c) => c.id === auth.user.id))
                        return false;
                } else {
                    if (
                        !assignees.some((c) =>
                            filters.collaboratorIds.includes(c.id),
                        )
                    )
                        return false;
                }
            }

            // Status filter: match if any selected status appears on the venue
            if (hasStatusFilter) {
                if (
                    !filters.statuses.some((s) =>
                        venueItem.orderVenue.status?.includes(s),
                    )
                )
                    return false;
            }

            // Country filter (demo has no venue, exclude when country filter active)
            if (hasCountryFilter) {
                if (isDemo) return false;
                const isUS = venueItem.venue!.country_id === 1;
                const usMatch = filters.country.us && isUS;
                const internationalMatch =
                    filters.country.international && !isUS;
                if (!usMatch && !internationalMatch) return false;
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
            .filter((g) => g.venues.some(venueMatchesAdvancedFilters))
            .map((g) => ({
                ...g,
                venues: g.venues.filter(venueMatchesAdvancedFilters),
            }));
    }, [
        groupedData,
        searchQuery,
        filters,
        auth.user.id,
        getClientUser,
        getTourVenueAssignees,
    ]);

    const hasVenueLevelFilter =
        filters.statuses.length > 0 ||
        !filters.country.us ||
        !filters.country.international;

    const hasClientFilter = filters.clientIds.length > 0 || filters.myClients;
    const hasCollaboratorFilter =
        filters.collaboratorIds.length > 0 || filters.myCollaborators;

    // Helper function to format date (short format: "Nov 8")
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    // Toggle order expansion
    const toggleOrderExpansion = (orderId: number) => {
        setExpandedOrders((prev) => {
            const newSet = new Set(prev);
            const isCurrentlyExpanded = newSet.has(orderId);

            if (isCurrentlyExpanded) {
                // Collapsing: clear selections for this order group
                newSet.delete(orderId);
                setSelectedVenueIds((prevSelected) => {
                    // Get all venue IDs for this order
                    const venueIdsForOrder = catalog.tour_venues
                        .filter((ov) => ov.tour_id === orderId)
                        .map((ov) => ov.id);
                    // Remove any selected venues that belong to this order
                    return prevSelected.filter(
                        (id) => !venueIdsForOrder.includes(id),
                    );
                });
            } else {
                // Expanding: just add to expanded set
                newSet.add(orderId);
            }
            return newSet;
        });
    };

    // Handle venue row selection (single selection across entire table)
    const handleVenueRowClick = (orderVenueId: number, orderId: number) => {
        setSelectedVenueIds((prev) => {
            // Toggle off if this venue was already selected
            if (prev.includes(orderVenueId)) {
                return [];
            }
            // Single selection: replace with just this venue
            return [orderVenueId];
        });
    };

    // Get selected order from first selected venue
    const selectedOrder = useMemo(() => {
        if (selectedVenueIds.length === 0) return null;
        const firstSelectedVenue = catalog.tour_venues.find(
            (ov) => ov.id === selectedVenueIds[0],
        );
        if (!firstSelectedVenue) return null;
        return (
            catalog.tours.find((o) => o.id === firstSelectedVenue.tour_id) ||
            null
        );
    }, [selectedVenueIds, catalog.tour_venues, catalog.tours]);

    return (
        <div className="table-content-max-width space-y-4">
            <OrdersTableHeaderActions
                selectedVenueCount={selectedVenueIds.length}
                onAddVenueClick={() => setIsAddVenueModalOpen(true)}
                filters={filters}
                onFilterChange={handleFilterChange}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                groupedData={groupedData}
                getClientUser={getClientUser}
                getTourVenueAssignees={getTourVenueAssignees}
            />

            {/* Table */}
            <div className="border-t">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[20%]">Name</TableHead>
                            <TableHead className="w-[35%]">Venue</TableHead>
                            <TableHead className="w-[10%]">Due Date</TableHead>
                            <TableHead className="w-[11%]">Client</TableHead>
                            <TableHead className="w-[12%]">
                                Collaborators
                            </TableHead>
                            <TableHead className="w-[12%]">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredGroupedData.length > 0 ? (
                            filteredGroupedData.map((group) => {
                                const isExpanded = expandedOrders.has(
                                    group.order.id,
                                );
                                const demoCtx =
                                    isExpanded && !hasVenueLevelFilter
                                        ? getVisibleOrderDemoContext(group, {
                                              hasVenueLevelFilter,
                                              hasClientFilter,
                                              hasCollaboratorFilter,
                                              filters,
                                              authUserId: auth.user.id,
                                              searchQuery,
                                              getClientUser,
                                              getTourVenueAssignees,
                                          })
                                        : null;
                                const venueStops = sortVenueStopsByCreatedDesc(
                                    group.venues.filter(
                                        (v) => v.venue !== null,
                                    ),
                                );

                                return (
                                    <Fragment
                                        key={`order-group-${group.order.id}`}
                                    >
                                        {/* Order Group Header */}
                                        <TableRow
                                            className="cursor-pointer text-lg font-semibold hover:bg-muted/50"
                                            onClick={() =>
                                                toggleOrderExpansion(
                                                    group.order.id,
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
                                                        {group.order.name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>

                                        {demoCtx && (
                                            <OrdersTableDemoRow
                                                order={group.order}
                                                demoItem={demoCtx.demoItem}
                                                owner={demoCtx.owner}
                                                assignees={demoCtx.assignees}
                                                onOpenSlideout={
                                                    setSelectedSlideout
                                                }
                                            />
                                        )}

                                        {isExpanded &&
                                            venueStops.map((venueItem) => {
                                                const venueIsSelected =
                                                    selectedVenueIds.includes(
                                                        venueItem.orderVenue.id,
                                                    );
                                                const client = getClientUser(
                                                    venueItem.orderVenue.client,
                                                );
                                                const assignees =
                                                    getTourVenueAssignees(
                                                        venueItem.orderVenue.id,
                                                    );
                                                return (
                                                    <OrdersTableVenueRow
                                                        key={`venue-${venueItem.orderVenue.id}`}
                                                        order={group.order}
                                                        venueItem={venueItem}
                                                        venueIsSelected={
                                                            venueIsSelected
                                                        }
                                                        client={client}
                                                        assignees={assignees}
                                                        formatDate={formatDate}
                                                        onVenueRowClick={
                                                            handleVenueRowClick
                                                        }
                                                        onOpenSlideout={
                                                            setSelectedSlideout
                                                        }
                                                    />
                                                );
                                            })}
                                    </Fragment>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="h-24 text-center"
                                ></TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Add Venue Modal */}
            <AddVenueModal
                isOpen={isAddVenueModalOpen}
                onClose={() => setIsAddVenueModalOpen(false)}
                orderId={selectedOrder?.id || 0}
                order={selectedOrder}
            />

            {/* Venue / Demo Detail Slideout */}
            <VenueDetailSlideout
                venueItem={selectedSlideout?.venueItem ?? null}
                order={selectedSlideout?.order ?? null}
                isOpen={selectedSlideout !== null}
                onClose={() => setSelectedSlideout(null)}
            />
        </div>
    );
}

export default OrdersTable;
