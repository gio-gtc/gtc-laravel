import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { venuesData } from '@/components/mockdata';
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
            header: ({ column }) => (
                <SortableHeader column={column}>Invoice #</SortableHeader>
            ),
            enableSorting: true,
            size: 120,
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
            header: ({ column }) => (
                <SortableHeader column={column}>Date</SortableHeader>
            ),
            enableSorting: true,
            size: 100,
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
            header: ({ column }) => (
                <SortableHeader column={column}>Tour</SortableHeader>
            ),
            enableSorting: true,
            size: 200,
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
            header: ({ column }) => (
                <SortableHeader column={column}>Market</SortableHeader>
            ),
            enableSorting: true,
            size: 150,
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
            accessorFn: (row) =>
                getInvoiceVenueName(row, venuesData),
            id: 'venue',
            header: ({ column }) => (
                <SortableHeader column={column}>Venue</SortableHeader>
            ),
            enableSorting: true,
            size: 200,
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
            header: ({ column }) => (
                <SortableHeader column={column}>Ref</SortableHeader>
            ),
            enableSorting: true,
            size: 150,
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
            header: ({ column }) => (
                <SortableHeader column={column}>Amt</SortableHeader>
            ),
            enableSorting: true,
            size: 120,
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
            header: ({ column }) => {
                return (
                    <SortableHeader column={column}>
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
            size: 120,
            cell: ({ row }) => {
                return getDayBadge(row.original);
            },
        },
    ];
}
