import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
interface InvoiceTableBaseProps {
    data: Invoice[];
    columns: ColumnDef<Invoice>[];
    onRowClick: (invoice: Invoice, event: React.MouseEvent) => void;
    isRowSelected: (invoice: Invoice) => boolean;
}

export function InvoiceTableBase({
    data,
    columns,
    onRowClick,
    isRowSelected,
}: InvoiceTableBaseProps) {
    const [sorting, setSorting] = useTableSorting();

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getRowId: (row) => String(row.id),
        enableSorting: true,
        onSortingChange: setSorting,
        state: {
            sorting,
        },
    });

    const tableWidths = [
        {
            perc: '7',
            min: '94',
        },
        {
            perc: '7',
            min: '80',
        },
        {
            perc: '17',
            min: '190',
        },
        {
            perc: '15',
            min: '165',
        },
        {
            perc: '22',
            min: '250',
        },
        {
            perc: '10',
            min: '120',
        },
        {
            perc: '9',
            min: '90',
        },
        {
            perc: '13',
            min: '124',
        },
    ];

    return (
        <Table compactRows className="border-y-1">
            <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header, i) => (
                            <TableHead
                                key={header.id}
                                style={{
                                    width: `${tableWidths[i].perc}%`,
                                    minWidth: `${tableWidths[i].min}px`,
                                }}
                                className={cn('px-2 py-0.5')}
                            >
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                          header.column.columnDef.header,
                                          header.getContext(),
                                      )}
                            </TableHead>
                        ))}
                    </TableRow>
                ))}
            </TableHeader>
            <TableBody className="text-xs font-semibold text-gray-500">
                {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => {
                        const isSelected = isRowSelected(row.original);

                        return (
                            <TableRow
                                key={row.id}
                                className={cn(
                                    'cursor-pointer select-none hover:bg-gray-100',
                                    isSelected && 'bg-red-100',
                                )}
                                onClick={(e) => onRowClick(row.original, e)}
                                onMouseDown={(e) => {
                                    if (e.shiftKey) {
                                        e.preventDefault();
                                    }
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
                                                'px-2 py-0.5 font-semibold',
                                                cellIndex < cells.length - 1 &&
                                                    'border-r border-border',
                                            )}
                                        >
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
    );
}
