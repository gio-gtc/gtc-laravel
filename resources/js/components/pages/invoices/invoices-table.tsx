import { invoicesData } from '@/components/mockdata';
import InvoiceDetailSlideout from '@/components/pages/invoices/invoice-detail-slideout';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatCurrency, getDaysRemaining } from '@/components/utils/functions';
import { cn } from '@/lib/utils';
import { type Invoice } from '@/types';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table';
import { Filter, HelpCircle, Search, SortAsc } from 'lucide-react';
import { useMemo, useState } from 'react';

function InvoicesTable() {
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(
        null,
    );
    const [columnSizing, setColumnSizing] = useState({});
    const [filter, setFilter] = useState<'all' | 'on-hold' | 'released'>('all');

    // Filter invoices based on selected filter
    const filteredData = useMemo(() => {
        if (filter === 'all') return invoicesData;
        if (filter === 'on-hold')
            return invoicesData.filter(
                (invoice) => invoice.held === 1 && !invoice.isDeleted,
            );
        if (filter === 'released')
            return invoicesData.filter(
                (invoice) => invoice.held === 0 && !invoice.isDeleted,
            );
        return invoicesData;
    }, [filter]);

    const data = useMemo(() => filteredData, [filteredData]);

    const getDayBadge = (invoice: Invoice) => {
        if (invoice.isDeleted) {
            return (
                <span className="inline-flex items-center rounded-full border-2 border-solid border-gray-400 bg-gray-50 px-2.5 py-0.5 text-xs font-medium">
                    DELETED
                </span>
            );
        }

        const daysRemaining =
            invoice.held === 1
                ? getDaysRemaining(invoice.showDate)
                : getDaysRemaining(
                      invoice?.invoiceReleaseDate ||
                          new Date().toISOString().split('T')[0],
                  );

        let extraClasses = '';
        const abb = invoice.held === 1 ? 'DTS: ' : 'Age: ';

        if (daysRemaining < 0) {
            // Red badge for past show date
            extraClasses = 'border-red-400 bg-red-50';
        } else if (daysRemaining <= 30) {
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
                {abb}
                {daysRemaining}
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
                accessorFn: (row) => {
                    // Calculate days between today and showDate for sorting using date-fns
                    return getDaysRemaining(row.showDate);
                },
                id: 'daysToShow',
                header: () => {
                    return (
                        <div className="flex items-center gap-0.5">
                            <span>Days</span>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-2 w-2 cursor-help text-blue-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <div className="space-y-1">
                                        <div>DTS = Days To Show</div>
                                        <div>Aged = Days Since Released</div>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    );
                },
                size: 120,
                cell: ({ row }) => {
                    return getDayBadge(row.original);
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
            <div className="flex justify-between gap-1 overflow-auto">
                <div className="flex items-center gap-1">
                    <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        onClick={() => setFilter('all')}
                        size="sm"
                    >
                        All
                    </Button>
                    <Button
                        variant={filter === 'on-hold' ? 'default' : 'outline'}
                        onClick={() => setFilter('on-hold')}
                        size="sm"
                    >
                        On Hold
                    </Button>
                    <Button
                        variant={filter === 'released' ? 'default' : 'outline'}
                        onClick={() => setFilter('released')}
                        size="sm"
                    >
                        Released
                    </Button>
                </div>
                <div className="flex items-center gap-1">
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
