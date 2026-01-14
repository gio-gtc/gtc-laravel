import { type Column } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { ReactNode } from 'react';

interface SortableHeaderProps<TData, TValue> {
    column: Column<TData, TValue>;
    children?: ReactNode;
    className?: string;
}

export function SortableHeader<TData, TValue>({
    column,
    children,
    className = '',
}: SortableHeaderProps<TData, TValue>) {
    return (
        <button
            className={`flex w-full items-center justify-between gap-1 hover:text-foreground ${className}`}
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
            <span>{children}</span>
            {column.getIsSorted() === 'asc' ? (
                <ArrowUp className="h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
                <ArrowDown className="h-4 w-4" />
            ) : (
                <ArrowUpDown className="h-4 w-4 opacity-50" />
            )}
        </button>
    );
}
