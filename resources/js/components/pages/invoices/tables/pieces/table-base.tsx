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
import { useState, type MouseEvent } from 'react';

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
    const [columnSizing, setColumnSizing] = useState({});
    const [sorting, setSorting] = useTableSorting();

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
                                        headerGroup.headers.indexOf(header) <
                                            headerGroup.headers.length - 1 &&
                                            'border-r border-border',
                                    )}
                                >
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.header,
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
                            const isSelected = isRowSelected(row.original);

                            return (
                                <TableRow
                                    key={row.id}
                                    className={cn(
                                        'cursor-pointer hover:bg-red-50 select-none',
                                        isSelected && 'bg-red-200',
                                        row.original.isDeleted && 'opacity-60',
                                    )}
                                    onClick={(e) => onRowClick(row.original, e)}
                                    onMouseDown={(e) => {
                                        // Prevent text selection when shift-clicking
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
                                                    'px-2 py-0.5',
                                                    cellIndex <
                                                        cells.length - 1 &&
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
        </div>
    );
}
