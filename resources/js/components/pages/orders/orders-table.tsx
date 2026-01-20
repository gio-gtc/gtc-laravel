import {
    mockUsers,
    orderData,
    orderVenueData,
    venueCollaboratorData,
    venuesData,
} from '@/components/mockdata';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { type Order, type OrderVenue, type User, type Venue } from '@/types';
import {
    ChevronDown,
    ChevronRight,
    Filter,
    Search,
    SortAsc,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import CollaboratorEditDialog from './collaborator-edit-dialog';
import StatusIcon from './status-icon';

type GroupedOrderData = {
    order: Order;
    venues: Array<{
        orderVenue: OrderVenue;
        venue: Venue;
    }>;
};

function OrdersTable() {
    const [expandedOrders, setExpandedOrders] = useState<Set<number>>(
        new Set(),
    );
    const [selectedVenueIds, setSelectedVenueIds] = useState<number[]>([]);
    const [editingVenueId, setEditingVenueId] = useState<number | null>(null);
    const getInitials = useInitials();

    // Transform data into grouped structure
    const groupedData = useMemo<GroupedOrderData[]>(() => {
        return orderData.map((order) => ({
            order,
            venues: orderVenueData
                .filter((ov) => ov.order_id === order.id)
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
            return mockUsers.filter((user) =>
                collaboratorIds.includes(user.id),
            );
        };
    }, []);

    // Helper function to get client user by ID
    const getClientUser = useMemo(() => {
        return (clientId: number): User | undefined => {
            return mockUsers.find((user) => user.id === clientId);
        };
    }, []);

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
                    const venueIdsForOrder = orderVenueData
                        .filter((ov) => ov.order_id === orderId)
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
                    ? orderVenueData.find((ov) => ov.id === prev[0])?.order_id
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
        <div className="space-y-4">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="outline">Add Vanue</Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        My Tours, US, +4
                        <span className="ml-2">×</span>
                    </Button>
                    <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                        <SortAsc className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                        <Search className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column, index) => (
                                <TableHead
                                    key={column.id}
                                    style={{
                                        width: column.size,
                                        position: 'relative',
                                    }}
                                    className={cn(
                                        'relative px-2 py-1',
                                        index < columns.length - 1 &&
                                            'border-r border-border',
                                    )}
                                >
                                    {column.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {groupedData.length > 0 ? (
                            groupedData.map((group) => {
                                const isExpanded = expandedOrders.has(
                                    group.order.id,
                                );

                                return (
                                    <>
                                        {/* Order Group Header */}
                                        <TableRow
                                            key={`order-${group.order.id}`}
                                            className="cursor-pointer text-lg font-semibold hover:bg-muted/50"
                                            onClick={() =>
                                                toggleOrderExpansion(
                                                    group.order.id,
                                                )
                                            }
                                        >
                                            <TableCell
                                                colSpan={6}
                                                className="px-2 py-1"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {isExpanded ? (
                                                        <ChevronDown className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4" />
                                                    )}
                                                    <span>
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
                                                            'cursor-pointer hover:bg-red-50',
                                                            venueIsSelected &&
                                                                'data-[state=selected]:bg-red-200',
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
                                                                'px-2 py-1 text-gray-500',
                                                                'border-r border-border',
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
                                                                <ChevronRight className="h-4 w-4 text-gray-400" />
                                                            </div>
                                                        </TableCell>
                                                        <TableCell
                                                            style={{
                                                                width: columns[1]
                                                                    .size,
                                                            }}
                                                            className={cn(
                                                                'px-2 py-1 text-gray-500',
                                                                'border-r border-border',
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
                                                                'px-2 py-1 text-gray-500',
                                                                'border-r border-border',
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
                                                                'px-2 py-1 text-gray-500',
                                                                'border-r border-border',
                                                            )}
                                                        >
                                                            {client && (
                                                                <Avatar className="h-7 w-7">
                                                                    <AvatarImage
                                                                        src={
                                                                            client.avatar ||
                                                                            undefined
                                                                        }
                                                                        alt={
                                                                            client.name
                                                                        }
                                                                    />
                                                                    <AvatarFallback className="bg-neutral-200 text-black">
                                                                        {getInitials(
                                                                            client.name,
                                                                        )}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            )}
                                                        </TableCell>
                                                        <TableCell
                                                            style={{
                                                                width: columns[4]
                                                                    .size,
                                                            }}
                                                            className={cn(
                                                                'px-2 py-1 text-gray-500',
                                                                'border-r border-border',
                                                            )}
                                                        >
                                                            <div
                                                                className="flex cursor-pointer items-center"
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    setEditingVenueId(
                                                                        venueItem
                                                                            .venue
                                                                            .id,
                                                                    );
                                                                }}
                                                            >
                                                                <div className="flex items-center">
                                                                    {collaborators
                                                                        .slice(
                                                                            0,
                                                                            3,
                                                                        )
                                                                        .map(
                                                                            (
                                                                                collab,
                                                                            ) => (
                                                                                <Avatar
                                                                                    key={
                                                                                        collab.id
                                                                                    }
                                                                                    className="-ml-3 h-7 w-7 border-2 border-background first:ml-0"
                                                                                >
                                                                                    <AvatarImage
                                                                                        src={
                                                                                            collab.avatar ||
                                                                                            undefined
                                                                                        }
                                                                                        alt={
                                                                                            collab.name
                                                                                        }
                                                                                    />
                                                                                    <AvatarFallback className="bg-neutral-200 text-black">
                                                                                        {getInitials(
                                                                                            collab.name,
                                                                                        )}
                                                                                    </AvatarFallback>
                                                                                </Avatar>
                                                                            ),
                                                                        )}
                                                                </div>
                                                                {collaborators.length >
                                                                    3 && (
                                                                    <span className="ml-2 text-xs text-muted-foreground">
                                                                        +
                                                                        {collaborators.length -
                                                                            3}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell
                                                            style={{
                                                                width: columns[5]
                                                                    .size,
                                                            }}
                                                            className="px-2 py-1 text-gray-500"
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
                                    </>
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
        </div>
    );
}

export default OrdersTable;
