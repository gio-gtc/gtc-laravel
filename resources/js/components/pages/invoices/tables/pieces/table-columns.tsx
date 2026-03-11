import { venuesData } from '@/components/mockdata';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    formatCurrency,
    getInvoiceVenueName,
} from '@/components/utils/functions';
import { SortableHeader } from '@/components/utils/sortable-header';
import { cn } from '@/lib/utils';
import { type Invoice } from '@/types';
import { type ColumnDef } from '@tanstack/react-table';
import { HelpCircle } from 'lucide-react';

interface CreateInvoiceColumnsOptions {
    getDayBadge: (invoice: Invoice) => React.ReactNode;
    daysAccessorFn: (row: Invoice) => number;
}

export function createInvoiceColumns({
    getDayBadge,
    daysAccessorFn,
}: CreateInvoiceColumnsOptions): ColumnDef<Invoice>[] {
    return [
        {
            accessorKey: 'invoiceNumber',
            header: ({ column, table }) => (
                <SortableHeader column={column} table={table}>
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
                <SortableHeader column={column} table={table}>Date</SortableHeader>
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
            accessorKey: 'tour',
            header: ({ column, table }) => (
                <SortableHeader column={column} table={table}>Tour</SortableHeader>
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
                <SortableHeader column={column} table={table}>
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
            accessorFn: (row) => getInvoiceVenueName(row, venuesData),
            id: 'venue',
            header: ({ column, table }) => (
                <SortableHeader column={column} table={table}>Venue</SortableHeader>
            ),
            enableSorting: true,
            cell: ({ row }) => {
                const value = getInvoiceVenueName(row.original, venuesData);
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
                <SortableHeader column={column} table={table}>Ref</SortableHeader>
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
                <SortableHeader column={column} table={table}>Amt</SortableHeader>
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
                    <SortableHeader column={column} table={table}>
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
