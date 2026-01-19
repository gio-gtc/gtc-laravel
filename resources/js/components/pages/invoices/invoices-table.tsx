import {
    companiesData,
    countriesData,
    invoicesData,
} from '@/components/mockdata';
import InvoiceAdvancedFilters from '@/components/pages/invoices/invoice-advanced-filters';
import InvoiceDetailSlideout from '@/components/pages/invoices/invoice-detail-slideout';
import InvoiceStatusFilters from '@/components/pages/invoices/invoice-status-filters';
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
import {
    formatCurrency,
    getDaysRemaining,
    getInvoiceAddress,
} from '@/components/utils/functions';
import { SortableHeader } from '@/components/utils/sortable-header';
import { useTableSorting } from '@/hooks/use-table-sorting';
import { cn } from '@/lib/utils';
import { type Invoice } from '@/types';
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table';
import { HelpCircle } from 'lucide-react';
import { useMemo, useState } from 'react';

function InvoicesTable() {
    // TODO: Filter buttons - US (buttons), International (buttons), Days (as date input [quick buttons - 30, 60, 90, custom] if held use showday if reaseled use release_date)
    // Component build: New table that is clickable and keeps on a list as a reminder for invoice payments (on release filter)
    // Data update: invoices have an address intially blank, if blank show company address from companies table (join) if filled out show invoice address
    // Change Released badge (Rule: Today -> Past ) to >-30 (Gray), >-60 (Yellow), >-90 (Red) ✅
    // Change on hold badge (Rule: Today -> Future) to <30 (Red), <60 (Yellow), >60 (Gray) ✅
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(
        null,
    );
    const [columnSizing, setColumnSizing] = useState({});
    const [sorting, setSorting] = useTableSorting();
    const [filter, setFilter] = useState<'all' | 'on-hold' | 'released'>(
        'on-hold',
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [countryFilter, setCountryFilter] = useState({
        us: true,
        international: true,
    });
    const [dateFilter, setDateFilter] = useState<'30' | '60' | '61+' | null>(
        null,
    );

    // Helper function to get country code for an invoice
    const getInvoiceCountryCode = (
        invoice: Invoice,
    ): 'US' | 'International' => {
        const company = companiesData.find((c) => c.id === invoice.company_id);
        if (!company) return 'International';

        const addressData = getInvoiceAddress(invoice, company);
        const countryId = addressData.country_id
            ? parseInt(addressData.country_id, 10)
            : null;

        if (!countryId) return 'International';

        const country = countriesData.find((c) => c.id === countryId);
        return country?.code === 'US' ? 'US' : 'International';
    };

    // Filter invoices based on selected filter and search query
    const filteredData = useMemo(() => {
        let result = invoicesData;

        // Apply held/released filter
        if (filter === 'on-hold') {
            result = result.filter(
                (invoice) => invoice.held === 1 && !invoice.isDeleted,
            );
        } else if (filter === 'released') {
            result = result.filter(
                (invoice) => invoice.held === 0 && !invoice.isDeleted,
            );
        }

        // Apply country filter
        if (countryFilter.us || countryFilter.international) {
            result = result.filter((invoice) => {
                const countryCode = getInvoiceCountryCode(invoice);
                if (countryFilter.us && countryFilter.international) {
                    return true;
                } else if (countryFilter.us) {
                    return countryCode === 'US';
                } else if (countryFilter.international) {
                    return countryCode === 'International';
                }
                return true;
            });
        }

        // Apply date filter
        if (dateFilter) {
            result = result.filter((invoice) => {
                const daysRemaining =
                    invoice.held === 1
                        ? getDaysRemaining(invoice.showDate)
                        : getDaysRemaining(invoice.release_date, invoice.id);

                if (invoice.held === 1) {
                    // On hold invoices: use showDate countdown
                    // Ranges: 30 = 0-30, 60 = 31-60, 61+ = 61+
                    if (dateFilter === '30') {
                        return daysRemaining >= 0 && daysRemaining <= 30;
                    } else if (dateFilter === '60') {
                        return daysRemaining > 30 && daysRemaining <= 60;
                    } else if (dateFilter === '61+') {
                        return daysRemaining > 60;
                    }
                } else {
                    // Released invoices: use release_date age
                    if (dateFilter === '30') {
                        return daysRemaining >= -30 && daysRemaining <= 0;
                    } else if (dateFilter === '60') {
                        return daysRemaining > -60 && daysRemaining <= -30;
                    } else if (dateFilter === '61+') {
                        return daysRemaining < -60;
                    }
                }
                return false;
            });
        }

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            result = result.filter((invoice) => {
                const invoiceNumber =
                    invoice.invoiceNumber?.toLowerCase() || '';
                const tour = invoice.tour?.toLowerCase() || '';
                const market = invoice.market?.toLowerCase() || '';
                const venue = invoice.venue?.toLowerCase() || '';
                const clientReference =
                    invoice.clientReference?.toLowerCase() || '';

                return (
                    invoiceNumber.includes(query) ||
                    tour.includes(query) ||
                    market.includes(query) ||
                    venue.includes(query) ||
                    clientReference.includes(query)
                );
            });
        }

        return result;
    }, [filter, searchQuery, countryFilter, dateFilter]);

    const data = useMemo(() => filteredData, [filteredData]);

    const getDayBadge = (invoice: Invoice) => {
        const normalClasses =
            'inline-flex items-center rounded-full border-2 border-solid px-2.5 py-0.5 text-xs font-medium';
        if (invoice.isDeleted) {
            return (
                <span className={`${normalClasses} border-gray-400 bg-gray-50`}>
                    DELETED
                </span>
            );
        }

        const daysRemaining =
            invoice.held === 1
                ? getDaysRemaining(invoice.showDate)
                : getDaysRemaining(invoice.release_date, invoice.id);

        let extraClasses = '';
        const abb = invoice.held === 1 ? 'DTS: ' : 'Age: ';

        if (invoice.held === 0) {
            // Released invoices: use release_date age
            if (daysRemaining > -30) {
                // Gray: within 30 days ago or future dates
                extraClasses = 'border-gray-400 bg-gray-50';
            } else if (daysRemaining > -60) {
                // Yellow: 30-60 days ago
                extraClasses = 'border-yellow-400 bg-yellow-50';
            } else {
                // Red: 60+ days ago
                extraClasses = 'border-red-400 bg-red-50';
            }
        } else {
            // On hold invoices: use showDate countdown
            if (daysRemaining <= 30) {
                // Red: 30 days or less until show, or past dates
                extraClasses = 'border-red-400 bg-red-50';
            } else if (daysRemaining <= 60) {
                // Yellow: 31-60 days until show
                extraClasses = 'border-yellow-400 bg-yellow-50';
            } else {
                // Gray: more than 60 days until show
                extraClasses = 'border-gray-400 bg-gray-50';
            }
        }

        return (
            <span className={`${normalClasses} ${extraClasses}`}>
                {abb}
                {daysRemaining}
            </span>
        );
    };

    const columns = useMemo<ColumnDef<Invoice>[]>(
        () => [
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
                header: ({ column }) => (
                    <SortableHeader column={column}>Venue</SortableHeader>
                ),
                enableSorting: true,
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
                                            <div>
                                                Aged = Days Since Released
                                            </div>
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
        ],
        [sorting],
    );

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getRowId: (row) => String(row.id),
        enableColumnResizing: true,
        enableSorting: true,
        columnResizeMode: 'onChange',
        onColumnSizingChange: setColumnSizing,
        onSortingChange: setSorting,
        state: {
            columnSizing,
            sorting,
        },
    });

    return (
        <div className="space-y-4">
            {/* Header Actions */}
            <div className="flex justify-between gap-1 overflow-auto">
                <InvoiceStatusFilters
                    filter={filter}
                    onFilterChange={setFilter}
                />
                <InvoiceAdvancedFilters
                    countryFilter={countryFilter}
                    onCountryFilterChange={setCountryFilter}
                    dateFilter={dateFilter}
                    onDateFilterChange={setDateFilter}
                    onSearchChange={setSearchQuery}
                />
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
