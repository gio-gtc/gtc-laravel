import { invoicesData } from '@/components/mockdata';
import InvoiceDetailSlideout from '@/components/pages/invoices/invoice-detail-slideout';
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
import { cn } from '@/lib/utils';
import { type Invoice } from '@/types';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table';
import { ChevronDown, Filter, Search, SortAsc } from 'lucide-react';
import { useMemo, useState } from 'react';

function InvoicesTable() {
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [columnSizing, setColumnSizing] = useState({});

    const data = useMemo(() => invoicesData, []);

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    const getDaysToShowBadge = (invoice: Invoice) => {
        const pillContent = invoice.isDeleted ? 'DELETED' : invoice.daysToShow;
        let extraClasses = '';

        if (pillContent === 'DELETED') {
            extraClasses = 'border-gray-400 bg-gray-50';
        } else if (pillContent < 0) {
            // Red badge for past show date
            extraClasses = 'border-red-400 bg-red-50';
        } else if (pillContent <= 30) {
            // Yellow badge for within 30 days
            extraClasses = 'border-yellow-400 bg-yellow-50';
        } else {
            // Gray badge for >30 days
            extraClasses = 'border-gray-400 bg-gray-50';
        }

        return (
            <span
                className={`inline-flex items-center rounded-full border-2 border-solid px-2.5 py-0.5 text-xs font-medium ${extraClasses}`}
            >
                {pillContent}
            </span>
        );
    };

    const columns = useMemo<ColumnDef<Invoice>[]>(
        () => [
            {
                accessorKey: 'invoiceNumber',
                header: 'Invoice #',
                size: 120,
                cell: ({ getValue, row }) => {
                    const value = getValue() as string;
                    return (
                        <div
                            className={cn(
                                row.original.isDeleted && 'text-gray-400',
                            )}
                        >
                            {value}
                        </div>
                    );
                },
            },
            {
                accessorKey: 'date',
                header: 'Date',
                size: 100,
                cell: ({ getValue, row }) => {
                    const value = getValue() as string;
                    return (
                        <div
                            className={cn(
                                row.original.isDeleted && 'text-gray-400',
                            )}
                        >
                            {value}
                        </div>
                    );
                },
            },
            {
                accessorKey: 'tour',
                header: 'Tour',
                size: 200,
                cell: ({ getValue, row }) => {
                    const value = getValue() as string;
                    return (
                        <div
                            className={cn(
                                row.original.isDeleted && 'text-gray-400',
                            )}
                        >
                            {value}
                        </div>
                    );
                },
            },
            {
                accessorKey: 'market',
                header: 'Market',
                size: 150,
                cell: ({ getValue, row }) => {
                    const value = getValue() as string;
                    return (
                        <div
                            className={cn(
                                row.original.isDeleted && 'text-gray-400',
                            )}
                        >
                            {value}
                        </div>
                    );
                },
            },
            {
                accessorKey: 'venue',
                header: 'Venue',
                size: 200,
                cell: ({ getValue, row }) => {
                    const value = getValue() as string;
                    return (
                        <div
                            className={cn(
                                row.original.isDeleted && 'text-gray-400',
                            )}
                        >
                            {value}
                        </div>
                    );
                },
            },
            {
                accessorKey: 'clientReference',
                header: 'Ref',
                size: 150,
                cell: ({ getValue, row }) => {
                    const value = getValue() as string;
                    return (
                        <div
                            className={cn(
                                row.original.isDeleted && 'text-gray-400',
                            )}
                        >
                            {value}
                        </div>
                    );
                },
            },
            {
                accessorKey: 'amount',
                header: 'Amt',
                size: 120,
                cell: ({ getValue, row }) => {
                    const value = getValue() as number;
                    return (
                        <div
                            className={cn(
                                row.original.isDeleted && 'text-gray-400',
                            )}
                        >
                            {formatCurrency(value)}
                        </div>
                    );
                },
            },
            {
                accessorKey: 'daysToShow',
                header: 'Days to Show',
                size: 120,
                cell: ({ row }) => {
                    return getDaysToShowBadge(row.original);
                },
            },
        ],
        [],
    );

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => String(row.id),
        enableColumnResizing: true,
        columnResizeMode: 'onChange',
        onColumnSizingChange: setColumnSizing,
        state: {
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
                            <DropdownMenuItem>New Invoice</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        Held, US, +2
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
                                            'relative px-2 py-0.5',
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
                                const isSelected =
                                    selectedInvoice?.id === row.original.id;

                                return (
                                    <TableRow
                                        key={row.id}
                                        className={cn(
                                            'cursor-pointer hover:bg-red-50',
                                            isSelected && 'bg-red-200',
                                            row.original.isDeleted &&
                                                'opacity-60',
                                        )}
                                        onClick={() => {
                                            setSelectedInvoice(
                                                isSelected
                                                    ? null
                                                    : row.original,
                                            );
                                        }}
                                    >
                                        {row
                                            .getVisibleCells()
                                            .map((cell, cellIndex, cells) => (
                                                <TableCell
                                                    key={cell.id}
                                                    style={{
                                                        width: cell.column.getSize(),
                                                    }}
                                                    className={cn(
                                                        'px-2 py-0.5',
                                                        cellIndex <
                                                            cells.length - 1 &&
                                                            'border-r border-border',
                                                    )}
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef
                                                            .cell,
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

            {/* Invoice Detail Slide-out */}
            <InvoiceDetailSlideout
                invoice={selectedInvoice}
                isOpen={selectedInvoice !== null}
                onClose={() => setSelectedInvoice(null)}
            />
        </div>
    );
}

export default InvoicesTable;
