import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { SortableHeader } from '@/components/utils/sortable-header';
import {
    formatCurrency,
    getInvoiceVenueName,
} from '@/helper-functions/format-currency';
import { cn } from '@/lib/utils';
import { type Invoice, type Venue } from '@/types';
import { type ColumnDef } from '@tanstack/react-table';
import { HelpCircle } from 'lucide-react';

/** Parse M/D/YY or MM/DD/YY date strings for sorting */
function parseInvoiceDate(dateStr: string): number {
    if (!dateStr) return 0;
    const [m, d, y] = dateStr.split('/').map(Number);
    const year = y != null && y < 100 ? 2000 + y : (y ?? 2000);
    return new Date(year, (m ?? 1) - 1, d ?? 1).getTime();
}

interface CreateInvoiceColumnsOptions {
    getDayBadge: (invoice: Invoice) => React.ReactNode;
    daysAccessorFn: (row: Invoice) => number;
    venues: Venue[];
}

export function createInvoiceColumns({
    getDayBadge,
    daysAccessorFn,
    venues,
}: CreateInvoiceColumnsOptions): ColumnDef<Invoice>[] {
    return [
        {
            accessorKey: 'invoiceNumber',
            header: ({ column, table }) => (
                <SortableHeader
                    column={column}
                    table={table}
                    sortedState={column.getIsSorted()}
                >
                    Invoice #
                </SortableHeader>
            ),
            enableSorting: true,
            cell: ({ getValue, row }) => {
                const value = getValue() as string;
                return (
                    <div
                        className={cn(
                            row.original.isDeleted && 'text-gray-300',
                        )}
                    >
                        {value}
                    </div>
                );
            },
        },
        {
            accessorKey: 'date',
            header: ({ column, table }) => (
                <SortableHeader
                    column={column}
                    table={table}
                    sortedState={column.getIsSorted()}
                >
                    Date
                </SortableHeader>
            ),
            enableSorting: true,
            sortingFn: (rowA, rowB, columnId) => {
                const a = rowA.getValue(columnId) as string;
                const b = rowB.getValue(columnId) as string;
                return parseInvoiceDate(a) - parseInvoiceDate(b);
            },
            cell: ({ getValue, row }) => {
                const value = getValue() as string;
                return (
                    <div
                        className={cn(
                            row.original.isDeleted && 'text-gray-300',
                        )}
                    >
                        {value}
                    </div>
                );
            },
        },
        {
            accessorKey: 'tour',
            header: ({ column, table }) => (
                <SortableHeader
                    column={column}
                    table={table}
                    sortedState={column.getIsSorted()}
                >
                    Tour
                </SortableHeader>
            ),
            enableSorting: true,
            cell: ({ getValue, row }) => {
                const value = getValue() as string;
                return (
                    <div
                        className={cn(
                            row.original.isDeleted && 'text-gray-300',
                        )}
                    >
                        {value}
                    </div>
                );
            },
        },
        {
            accessorKey: 'market',
            header: ({ column, table }) => (
                <SortableHeader
                    column={column}
                    table={table}
                    sortedState={column.getIsSorted()}
                >
                    Market
                </SortableHeader>
            ),
            enableSorting: true,
            cell: ({ getValue, row }) => {
                const value = getValue() as string;
                return (
                    <div
                        className={cn(
                            row.original.isDeleted && 'text-gray-300',
                        )}
                    >
                        {value}
                    </div>
                );
            },
        },
        {
            accessorFn: (row) => getInvoiceVenueName(row, venues),
            id: 'venue',
            header: ({ column, table }) => (
                <SortableHeader
                    column={column}
                    table={table}
                    sortedState={column.getIsSorted()}
                >
                    Venue
                </SortableHeader>
            ),
            enableSorting: true,
            cell: ({ row }) => {
                const value = getInvoiceVenueName(row.original, venues);
                return (
                    <div
                        className={cn(
                            row.original.isDeleted && 'text-gray-300',
                        )}
                    >
                        {value}
                    </div>
                );
            },
        },
        {
            accessorKey: 'clientReference',
            header: ({ column, table }) => (
                <SortableHeader
                    column={column}
                    table={table}
                    sortedState={column.getIsSorted()}
                >
                    Ref
                </SortableHeader>
            ),
            enableSorting: true,
            cell: ({ getValue, row }) => {
                const value = getValue() as string;
                return (
                    <div
                        className={cn(
                            row.original.isDeleted && 'text-gray-300',
                        )}
                    >
                        {value}
                    </div>
                );
            },
        },
        {
            accessorKey: 'amount',
            header: ({ column, table }) => (
                <SortableHeader
                    column={column}
                    table={table}
                    sortedState={column.getIsSorted()}
                >
                    Amt
                </SortableHeader>
            ),
            enableSorting: true,
            cell: ({ getValue, row }) => {
                const value = getValue() as number;
                return (
                    <div
                        className={cn(
                            row.original.isDeleted && 'text-gray-300',
                        )}
                    >
                        {formatCurrency(value)}
                    </div>
                );
            },
        },
        {
            accessorFn: daysAccessorFn,
            id: 'daysToShow',
            header: ({ column, table }) => {
                return (
                    <SortableHeader
                        column={column}
                        table={table}
                        sortedState={column.getIsSorted()}
                    >
                        <div className="flex items-start gap-0.5">
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
                    </SortableHeader>
                );
            },
            enableSorting: true,
            cell: ({ row }) => {
                return getDayBadge(row.original);
            },
        },
    ];
}
