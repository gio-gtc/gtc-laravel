import {
    tourData,
    tourVenueData,
    venueCollaboratorData,
    venuesData,
} from '@/components/mockdata';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { UserAvatar } from '@/components/ui/user-avatar';
import { UserAvatarsStack } from '@/components/ui/user-avatars-stack';
import { useOrdersFilters } from '@/hooks/use-orders-filters';
import { useRecentOrders } from '@/hooks/use-recent-orders';
import { useUsersWithFallback } from '@/hooks/use-users-with-fallback';
import { cn, resolveUrl } from '@/lib/utils';
import {
    type SharedData,
    type Tour,
    type TourVenue,
    type User,
    type Venue,
} from '@/types';
import { router, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import AddVenueModal from './add-venue-modal';
import CollaboratorEditDialog from './collaborator-edit-dialog';
import OrdersTableHeaderActions, {
    type GroupedOrderData,
} from './orders-table-header-actions';
import { orders } from '@/routes';
import VenueDetailSlideout from './slideout';
import StatusIcon from './status-icon';

function OrdersTable() {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const [filters, setFilters] = useOrdersFilters();
    const { addRecentOrder } = useRecentOrders();
    const [expandedOrders, setExpandedOrders] = useState<Set<number>>(
        new Set(),
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedVenueIds, setSelectedVenueIds] = useState<number[]>([]);
    const [editingVenueId, setEditingVenueId] = useState<number | null>(null);
    const [isAddVenueModalOpen, setIsAddVenueModalOpen] = useState(false);
    const [selectedVenueForSlideout, setSelectedVenueForSlideout] = useState<{
        orderVenue: TourVenue;
        venue: Venue;
        order: Tour;
    } | null>(null);
    const usersWithFallback = useUsersWithFallback();

    // Transform data into grouped structure
    const groupedData = useMemo<GroupedOrderData[]>(() => {
        return tourData.map((order) => ({
            order,
            venues: tourVenueData
                .filter((ov) => ov.tour_id === order.id)
                .map((ov) => ({
                    orderVenue: ov,
                    venue: venuesData.find((v) => v.id === ov.venue_id)!,
                }))
                .filter((item) => item.venue !== undefined),
        }));
    }, []);

    // Helper function to get collaborators for a venue
    const getVenueCollaborators = useMemo(() => {
        return (venueId: number): User[] => {
            const collaboratorIds = venueCollaboratorData
                .filter((vc) => vc.venue_id === venueId)
                .map((vc) => vc.mockUser_id);
            return usersWithFallback.filter((user) =>
                collaboratorIds.includes(user.id),
            );
        };
    }, [usersWithFallback]);

    // Helper function to get client user by ID
    const getClientUser = useMemo(() => {
        return (clientId: number): User | undefined => {
            return usersWithFallback.find((user) => user.id === clientId);
        };
    }, [usersWithFallback]);

    // Record venue to recent list when slideout is opened
    useEffect(() => {
        if (selectedVenueForSlideout) {
            addRecentOrder({
                tourVenueId: selectedVenueForSlideout.orderVenue.id,
                tourName: selectedVenueForSlideout.order.name,
                venueName: selectedVenueForSlideout.venue.name,
            });
        }
    }, [selectedVenueForSlideout, addRecentOrder]);

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
                setSelectedVenueForSlideout({
                    orderVenue: venueItem.orderVenue,
                    venue: venueItem.venue,
                    order: group.order,
                });
                router.visit(resolveUrl(orders()), {
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
                venue: Venue;
            }) => {
                const region = `${venueItem.venue.city}, ${venueItem.venue.state}`;
                const client = getClientUser(venueItem.orderVenue.client);
                const collaborators = getVenueCollaborators(venueItem.venue.id);
                return (
                    region.toLowerCase().includes(query) ||
                    venueItem.venue.name.toLowerCase().includes(query) ||
                    (client?.name?.toLowerCase().includes(query) ?? false) ||
                    collaborators.some((c) =>
                        c.name.toLowerCase().includes(query),
                    )
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
            venue: Venue;
        }): boolean => {
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

            // Collaborator filter (when myCollaborators, ignore collaboratorIds per plan)
            if (hasCollaboratorFilter) {
                const collaborators = getVenueCollaborators(venueItem.venue.id);
                if (filters.myCollaborators) {
                    if (!collaborators.some((c) => c.id === auth.user.id))
                        return false;
                } else {
                    if (
                        !collaborators.some((c) =>
                            filters.collaboratorIds.includes(c.id),
                        )
                    )
                        return false;
                }
            }

            // Status filter
            if (hasStatusFilter) {
                if (!filters.statuses.includes(venueItem.orderVenue.status))
                    return false;
            }

            // Country filter
            if (hasCountryFilter) {
                const isUS = venueItem.venue.country_id === 1;
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
        getVenueCollaborators,
    ]);

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
                    const venueIdsForOrder = tourVenueData
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

    // Handle venue row selection
    const handleVenueRowClick = (orderVenueId: number, orderId: number) => {
        setSelectedVenueIds((prev) => {
            // Check if any existing selection belongs to a different order group
            const existingOrderId =
                prev.length > 0
                    ? tourVenueData.find((ov) => ov.id === prev[0])?.tour_id
                    : null;

            // If selecting from a different group, clear and start fresh
            if (existingOrderId !== null && existingOrderId !== orderId) {
                return [orderVenueId];
            }

            // Toggle selection within the same group
            if (prev.includes(orderVenueId)) {
                return prev.filter((id) => id !== orderVenueId);
            }
            return [...prev, orderVenueId];
        });
    };

    // Get selected order from first selected venue
    const selectedOrder = useMemo(() => {
        if (selectedVenueIds.length === 0) return null;
        const firstSelectedVenue = tourVenueData.find(
            (ov) => ov.id === selectedVenueIds[0],
        );
        if (!firstSelectedVenue) return null;
        return (
            tourData.find((o) => o.id === firstSelectedVenue.tour_id) || null
        );
    }, [selectedVenueIds]);

    // Column definitions for table headers (used for sizing only)
    const columns = useMemo(
        () => [
            {
                id: 'name',
                header: 'Name',
                size: 200,
                minSize: 100,
                maxSize: 500,
            },
            {
                id: 'venue',
                header: 'Venue',
                size: 200,
                minSize: 150,
                maxSize: 400,
            },
            {
                id: 'dueDate',
                header: 'Due Date',
                size: 150,
                minSize: 100,
                maxSize: 200,
            },
            {
                id: 'client',
                header: 'Client',
                size: 100,
                minSize: 80,
                maxSize: 200,
            },
            {
                id: 'collaborators',
                header: 'Collaborators',
                size: 150,
                minSize: 100,
                maxSize: 300,
            },
            {
                id: 'status',
                header: 'Status',
                size: 100,
                minSize: 80,
                maxSize: 150,
            },
        ],
        [],
    );

    return (
        <div className="table-content-max-width space-y-4">
            <OrdersTableHeaderActions
                selectedVenueCount={selectedVenueIds.length}
                onAddVenueClick={() => setIsAddVenueModalOpen(true)}
                filters={filters}
                onFilterChange={setFilters}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                groupedData={groupedData}
                getClientUser={getClientUser}
                getVenueCollaborators={getVenueCollaborators}
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
                                                    {isExpanded ? (
                                                        <ChevronDown className="h-1.5 w-2 text-gray-600" />
                                                    ) : (
                                                        <ChevronRight className="h-1.5 w-2 text-gray-600" />
                                                    )}
                                                    <span className="text-gray-700">
                                                        {group.order.name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                        {/* Venue Detail Rows */}
                                        {isExpanded &&
                                            group.venues.map((venueItem) => {
                                                const venueIsSelected =
                                                    selectedVenueIds.includes(
                                                        venueItem.orderVenue.id,
                                                    );
                                                const client = getClientUser(
                                                    venueItem.orderVenue.client,
                                                );
                                                const collaborators =
                                                    getVenueCollaborators(
                                                        venueItem.venue.id,
                                                    );

                                                return (
                                                    <TableRow
                                                        key={`venue-${venueItem.orderVenue.id}`}
                                                        data-state={
                                                            venueIsSelected &&
                                                            'selected'
                                                        }
                                                        className={cn(
                                                            'xs-gray-500-weight-600 cursor-pointer hover:bg-gray-100',
                                                            venueIsSelected &&
                                                                'data-[state=selected]:bg-red-100',
                                                        )}
                                                        onClick={() =>
                                                            handleVenueRowClick(
                                                                venueItem
                                                                    .orderVenue
                                                                    .id,
                                                                group.order.id,
                                                            )
                                                        }
                                                    >
                                                        <TableCell
                                                            style={{
                                                                width: columns[0]
                                                                    .size,
                                                            }}
                                                            className={cn(
                                                                'px-2 py-0.5 text-gray-500',
                                                            )}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span>
                                                                    {
                                                                        venueItem
                                                                            .venue
                                                                            .city
                                                                    }
                                                                    ,{' '}
                                                                    {
                                                                        venueItem
                                                                            .venue
                                                                            .state
                                                                    }
                                                                </span>
                                                                <ChevronRight
                                                                    className="h-2.5 w-2.5 cursor-pointer text-gray-400 hover:text-gray-600"
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        setSelectedVenueForSlideout(
                                                                            {
                                                                                orderVenue:
                                                                                    venueItem.orderVenue,
                                                                                venue: venueItem.venue,
                                                                                order: group.order,
                                                                            },
                                                                        );
                                                                    }}
                                                                />
                                                            </div>
                                                        </TableCell>
                                                        <TableCell
                                                            style={{
                                                                width: columns[1]
                                                                    .size,
                                                            }}
                                                            className={cn(
                                                                'px-2 py-0.5 text-gray-500',
                                                            )}
                                                        >
                                                            {
                                                                venueItem.venue
                                                                    .name
                                                            }
                                                        </TableCell>
                                                        <TableCell
                                                            style={{
                                                                width: columns[2]
                                                                    .size,
                                                            }}
                                                            className={cn(
                                                                'px-2 py-0.5 text-gray-500',
                                                            )}
                                                        >
                                                            {formatDate(
                                                                venueItem
                                                                    .orderVenue
                                                                    .start_date,
                                                            )}
                                                        </TableCell>
                                                        <TableCell
                                                            style={{
                                                                width: columns[3]
                                                                    .size,
                                                            }}
                                                            className={cn(
                                                                'px-2 py-0.5 text-gray-500',
                                                            )}
                                                        >
                                                            {client && (
                                                                <UserAvatar
                                                                    user={
                                                                        client
                                                                    }
                                                                />
                                                            )}
                                                        </TableCell>
                                                        <TableCell
                                                            style={{
                                                                width: columns[4]
                                                                    .size,
                                                            }}
                                                            className={cn(
                                                                'px-2 py-0.5 text-gray-500',
                                                            )}
                                                        >
                                                            <UserAvatarsStack
                                                                users={
                                                                    collaborators
                                                                }
                                                                maxCount={3}
                                                                onClick={() =>
                                                                    setEditingVenueId(
                                                                        venueItem
                                                                            .venue
                                                                            .id,
                                                                    )
                                                                }
                                                            />
                                                        </TableCell>
                                                        <TableCell
                                                            style={{
                                                                width: columns[5]
                                                                    .size,
                                                            }}
                                                            className="px-2 py-[1px] text-gray-500"
                                                        >
                                                            <StatusIcon
                                                                status={
                                                                    venueItem
                                                                        .orderVenue
                                                                        .status
                                                                }
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                    </Fragment>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Collaborator Edit Dialog */}
            {editingVenueId && (
                <CollaboratorEditDialog
                    venueId={editingVenueId}
                    venue={
                        venuesData.find((v) => v.id === editingVenueId) || null
                    }
                    isOpen={!!editingVenueId}
                    onClose={() => setEditingVenueId(null)}
                />
            )}

            {/* Add Venue Modal */}
            <AddVenueModal
                isOpen={isAddVenueModalOpen}
                onClose={() => setIsAddVenueModalOpen(false)}
                orderId={selectedOrder?.id || 0}
                order={selectedOrder}
            />

            {/* Venue Detail Slideout */}
            <VenueDetailSlideout
                venueItem={
                    selectedVenueForSlideout
                        ? {
                              orderVenue: selectedVenueForSlideout.orderVenue,
                              venue: selectedVenueForSlideout.venue,
                          }
                        : null
                }
                order={selectedVenueForSlideout?.order || null}
                isOpen={selectedVenueForSlideout !== null}
                onClose={() => setSelectedVenueForSlideout(null)}
            />
        </div>
    );
}

export default OrdersTable;
