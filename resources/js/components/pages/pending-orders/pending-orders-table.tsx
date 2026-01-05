import { pendingOrdersData } from '@/components/mockdata';
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
import { type User } from '@/types';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table';
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

interface PendingOrder {
    id: string;
    artist: string;
    name: string;
    venue: string;
    dueDate: string;
    client: User;
    collaborators: User[];
    status: 'completed' | 'in-progress' | 'pending' | 'paused' | 'edit';
    isGroupHeader?: boolean;
}

function PendingOrdersTable() {
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>(
        {},
    );
    const [expanded, setExpanded] = useState<Record<string, boolean>>({
        'Matt Rife': true,
        Eagles: false,
    });
    const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
    const getInitials = useInitials();

    const data = useMemo(() => pendingOrdersData, []);

    const columns = useMemo<ColumnDef<PendingOrder>[]>(
        () => [
            {
                accessorKey: 'name',
                header: 'Name',
                cell: ({ row, getValue }) => {
                    if (row.original.isGroupHeader) {
                        return (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        const artist = row.original.artist;
                                        setExpanded((prev) => ({
                                            ...prev,
                                            [artist]: !prev[artist],
                                        }));
                                    }}
                                    className="flex items-center"
                                >
                                    {expanded[row.original.artist] ? (
                                        <ChevronDown className="h-4 w-4" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4" />
                                    )}
                                </button>
                                <span className="font-medium">
                                    {row.original.artist}
                                </span>
                            </div>
                        );
                    }
                    return <div>{getValue() as string}</div>;
                },
            },
            {
                accessorKey: 'venue',
                header: 'Venue',
                cell: ({ getValue }) => {
                    const venue = getValue() as string;
                    return <div>{venue || ''}</div>;
                },
            },
            {
                accessorKey: 'dueDate',
                header: 'Due Date',
                cell: ({ getValue }) => {
                    const date = getValue() as string;
                    return <div>{date || ''}</div>;
                },
            },
            {
                accessorKey: 'client',
                header: 'Client',
                cell: ({ row }) => {
                    if (row.original.isGroupHeader) {
                        return null;
                    }
                    const client = row.original.client;
                    return (
                        <div className="flex items-center">
                            <Avatar className="h-7 w-7">
                                <AvatarImage
                                    src={client.avatar}
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
                accessorKey: 'collaborators',
                header: 'Collaborators',
                cell: ({ row }) => {
                    if (row.original.isGroupHeader) {
                        return null;
                    }
                    const collaborators = row.original.collaborators;
                    return (
                        <div
                            className="flex cursor-pointer items-center"
                            onClick={(e) => {
                                e.stopPropagation();
                                setEditingOrderId(row.original.id);
                            }}
                        >
                            <div className="flex items-center">
                                {collaborators
                                    .slice(0, 3)
                                    .map((collab, idx) => (
                                        <Avatar
                                            key={idx}
                                            className="-ml-3 h-7 w-7 border-2 border-background first:ml-0"
                                        >
                                            <AvatarImage
                                                src={collab.avatar}
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
                cell: ({ row }) => {
                    if (row.original.isGroupHeader) {
                        return null;
                    }
                    return <StatusIcon status={row.original.status} />;
                },
            },
        ],
        [expanded, getInitials, setEditingOrderId],
    );

    const groupedData = useMemo(() => {
        const groups: Record<string, PendingOrder[]> = {};
        data.forEach((order) => {
            if (!groups[order.artist]) {
                groups[order.artist] = [];
            }
            groups[order.artist].push(order as unknown as PendingOrder);
        });

        const result: PendingOrder[] = [];
        Object.keys(groups).forEach((artist) => {
            const orders = groups[artist];
            result.push({
                ...orders[0],
                name: artist,
                isGroupHeader: true,
            } as PendingOrder);
            if (expanded[artist]) {
                result.push(...orders.filter((o) => !o.isGroupHeader));
            }
        });
        return result;
    }, [data, expanded]);

    const table = useReactTable({
        data: groupedData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        state: {
            rowSelection,
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
                    <Button variant="outline" size="sm">
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
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext(),
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => {
                                console.log({ row });
                                const isGroupHeader =
                                    row.original.isGroupHeader;
                                const isSelected = row.getIsSelected();

                                return (
                                    <TableRow
                                        key={row.id}
                                        data-state={isSelected && 'selected'}
                                        className={cn(
                                            !isGroupHeader &&
                                                'cursor-pointer hover:bg-muted/50',
                                            isSelected &&
                                                !isGroupHeader &&
                                                'bg-muted',
                                        )}
                                        onClick={() => {
                                            if (!isGroupHeader) {
                                                row.toggleSelected();
                                            }
                                        }}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </TableCell>
                                        ))}
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
            {editingOrderId && (
                <CollaboratorEditDialog
                    orderId={editingOrderId}
                    order={
                        (data.find(
                            (o) => o.id === editingOrderId,
                        ) as unknown as {
                            id: string;
                            artist: string;
                            name: string;
                            venue: string;
                            dueDate: string;
                            client: User;
                            collaborators: User[];
                            status: string;
                            isGroupHeader?: boolean;
                        }) || null
                    }
                    isOpen={!!editingOrderId}
                    onClose={() => setEditingOrderId(null)}
                />
            )}
        </div>
    );
}

export default PendingOrdersTable;
