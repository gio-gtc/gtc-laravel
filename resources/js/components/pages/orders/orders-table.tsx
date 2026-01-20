import {
    venuesData,
    venueCollaboratorData,
    mockUsers,
} from '@/components/mockdata';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { type Venue, type User } from '@/types';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table';
import { Filter, Search, SortAsc } from 'lucide-react';
import { useMemo, useState } from 'react';
import CollaboratorEditDialog from './collaborator-edit-dialog';
import StatusIcon from './status-icon';

function OrdersTable() {
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>(
        {},
    );
    const [editingVenueId, setEditingVenueId] = useState<number | null>(null);
    const [columnSizing, setColumnSizing] = useState({});
    const getInitials = useInitials();

    const data = useMemo(() => venuesData, []);

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

    // Helper function to format date
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const columns = useMemo<ColumnDef<Venue>[]>(
        () => [
            {
                accessorKey: 'name',
                header: 'Name',
                size: 200,
                minSize: 100,
                maxSize: 500,
                cell: ({ getValue }) => {
                    return <div>{getValue() as string}</div>;
                },
            },
            {
                accessorKey: 'city',
                header: 'Location',
                size: 150,
                minSize: 100,
                maxSize: 300,
                cell: ({ row }) => {
                    return (
                        <div>
                            {row.original.city}, {row.original.state}
                        </div>
                    );
                },
            },
            {
                accessorKey: 'showDateStart',
                header: 'Show Date',
                size: 150,
                minSize: 100,
                maxSize: 200,
                cell: ({ row }) => {
                    const start = formatDate(row.original.showDateStart);
                    const end = formatDate(row.original.showDateEnd);
                    return (
                        <div>
                            {start === end ? start : `${start} - ${end}`}
                        </div>
                    );
                },
            },
            {
                accessorKey: 'client',
                header: 'Client',
                size: 100,
                minSize: 80,
                maxSize: 200,
                cell: ({ row }) => {
                    const client = getClientUser(row.original.client);
                    if (!client) return null;
                    return (
                        <div className="flex items-center">
                            <Avatar className="h-7 w-7">
                                <AvatarImage
                                    src={client.avatar || undefined}
                                    alt={client.name}
                                />
                                <AvatarFallback className="bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                    {getInitials(client.name)}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    );
                },
            },
            {
                id: 'collaborators',
                header: 'Collaborators',
                size: 150,
                minSize: 100,
                maxSize: 300,
                cell: ({ row }) => {
                    const collaborators = getVenueCollaborators(
                        row.original.id,
                    );
                    return (
                        <div
                            className="flex cursor-pointer items-center"
                            onClick={(e) => {
                                e.stopPropagation();
                                setEditingVenueId(row.original.id);
                            }}
                        >
                            <div className="flex items-center">
                                {collaborators.slice(0, 3).map((collab, idx) => (
                                    <Avatar
                                        key={collab.id}
                                        className="-ml-3 h-7 w-7 border-2 border-background first:ml-0"
                                    >
                                        <AvatarImage
                                            src={collab.avatar || undefined}
                                            alt={collab.name}
                                        />
                                        <AvatarFallback className="bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                            {getInitials(collab.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                ))}
                            </div>
                            {collaborators.length > 3 && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                    +{collaborators.length - 3}
                                </span>
                            )}
                        </div>
                    );
                },
            },
            {
                accessorKey: 'status',
                header: 'Status',
                size: 100,
                minSize: 80,
                maxSize: 150,
                cell: ({ row }) => {
                    return <StatusIcon status={row.original.status} />;
                },
            },
        ],
        [getInitials, getClientUser, getVenueCollaborators],
    );

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => String(row.id),
        enableRowSelection: true,
        enableColumnResizing: true,
        columnResizeMode: 'onChange',
        onRowSelectionChange: setRowSelection,
        onColumnSizingChange: setColumnSizing,
        state: {
            rowSelection,
            columnSizing,
        },
    });

    return (
        <div className="space-y-4">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                Add New
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>New Order</DropdownMenuItem>
                            <DropdownMenuItem>New Tour</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        style={{
                                            width: header.getSize(),
                                            position: 'relative',
                                        }}
                                        className={cn(
                                            'relative px-2 py-1',
                                            headerGroup.headers.indexOf(
                                                header,
                                            ) <
                                                headerGroup.headers.length -
                                                    1 &&
                                                'border-r border-border',
                                        )}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext(),
                                              )}
                                        {header.column.getCanResize() && (
                                            <div
                                                onMouseDown={header.getResizeHandler()}
                                                onTouchStart={header.getResizeHandler()}
                                                className={cn(
                                                    'absolute top-0 right-0 z-10 h-full w-0.5 cursor-col-resize touch-none bg-border opacity-50 transition-opacity select-none hover:bg-primary hover:opacity-100',
                                                    header.column.getIsResizing() &&
                                                        'bg-primary opacity-100',
                                                )}
                                                style={{
                                                    transform:
                                                        header.column.getIsResizing()
                                                            ? `translateX(${
                                                                  table.getState()
                                                                      .columnSizingInfo
                                                                      .deltaOffset
                                                              }px)`
                                                            : undefined,
                                                }}
                                            />
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => {
                                const isSelected = row.getIsSelected();

                                return (
                                    <TableRow
                                        key={row.id}
                                        data-state={isSelected && 'selected'}
                                        className={cn(
                                            'cursor-pointer hover:bg-muted/50',
                                            isSelected &&
                                                'data-[state=selected]:bg-red-100',
                                        )}
                                        onClick={() => {
                                            row.toggleSelected();
                                        }}
                                    >
                                        {row
                                            .getVisibleCells()
                                            .map(
                                                (
                                                    cell,
                                                    cellIndex,
                                                    cells,
                                                ) => (
                                                    <TableCell
                                                        key={cell.id}
                                                        style={{
                                                            width: cell.column.getSize(),
                                                        }}
                                                        className={cn(
                                                            'px-2 py-1 text-gray-500',
                                                            cellIndex <
                                                                cells.length -
                                                                    1 &&
                                                                'border-r border-border',
                                                        )}
                                                    >
                                                        {flexRender(
                                                            cell.column
                                                                .columnDef.cell,
                                                            cell.getContext(),
                                                        )}
                                                    </TableCell>
                                                ),
                                            )}
                                    </TableRow>
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
                    venue={data.find((v) => v.id === editingVenueId) || null}
                    isOpen={!!editingVenueId}
                    onClose={() => setEditingVenueId(null)}
                />
            )}
        </div>
    );
}

export default OrdersTable;
