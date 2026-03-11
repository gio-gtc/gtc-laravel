import { type Column, type Table } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { ReactNode } from 'react';

type SortDirection = 'asc' | 'desc';

interface SortableHeaderProps<TData, TValue> {
    column: Column<TData, TValue>;
    table?: Table<TData>;
    children?: ReactNode;
    className?: string;
    /** Pass explicitly to force re-render when sorting changes (column/table refs are stable) */
    sortedState?: false | SortDirection;
}

export function SortableHeader<TData, TValue>({
    column,
    table,
    children,
    className = '',
    sortedState: sortedStateProp,
}: SortableHeaderProps<TData, TValue>) {
    const sortedState = sortedStateProp ?? column.getIsSorted();

    return (
        <button
            className={`flex w-full items-center justify-between gap-1 hover:text-foreground ${className}`}
            onClick={() => column.toggleSorting()}
        >
            <span>{children}</span>
            {sortedState === 'asc' ? (
                <ArrowUp className="size-[14px]" />
            ) : sortedState === 'desc' ? (
                <ArrowDown className="size-[14px]" />
            ) : (
                <ArrowUpDown className="size-[14px] opacity-50" />
            )}
        </button>
    );
}
