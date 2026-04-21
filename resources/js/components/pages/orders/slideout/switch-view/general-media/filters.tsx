import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import Divider from '@/components/utils/divider';
import { cn } from '@/lib/utils';
import { type MediaTableRow } from '@/types';
import { ArrowDown, ArrowUp, ArrowUpDown, Filter, X } from 'lucide-react';

const MEDIA_STATUS_OPTIONS: {
    value: MediaTableRow['status'];
    label: string;
}[] = [
    { value: 'Still in Cart', label: 'Still in Cart' },
    { value: 'Client Review', label: 'Client Review' },
    { value: 'In Production', label: 'In Production' },
    { value: 'Out for Delivery', label: 'Out for Delivery' },
    { value: 'Cancelled', label: 'Cancelled' },
    { value: 'Revision Requested', label: 'Revision Requested' },
    { value: 'Unassigned', label: 'Unassigned' },
];

export type MediaStatusFilter = MediaTableRow['status'][];
export type SortDirection = 'asc' | 'desc' | null;

interface FiltersProps {
    statusFilter: MediaStatusFilter;
    onStatusFilterChange: (filter: MediaStatusFilter) => void;
    sortDirection: SortDirection;
    onSortDirectionChange: (direction: SortDirection) => void;
    demoLinkHref?: string;
}

export default function Filters({
    statusFilter,
    onStatusFilterChange,
    sortDirection,
    onSortDirectionChange,
    demoLinkHref,
}: FiltersProps) {
    const hasActiveStatusFilter = statusFilter.length > 0;

    const toggleStatus = (status: MediaTableRow['status']) => {
        const isSelected = statusFilter.includes(status);
        onStatusFilterChange(
            isSelected
                ? statusFilter.filter((s) => s !== status)
                : [...statusFilter, status],
        );
    };

    const cycleSortDirection = () => {
        if (sortDirection === null) {
            onSortDirectionChange('asc');
        } else if (sortDirection === 'asc') {
            onSortDirectionChange('desc');
        } else {
            onSortDirectionChange(null);
        }
    };

    const SortIcon =
        sortDirection === 'asc'
            ? ArrowUp
            : sortDirection === 'desc'
              ? ArrowDown
              : ArrowUpDown;

    return (
        <div className="flex items-center justify-end gap-1">
            {demoLinkHref != null && demoLinkHref !== '' ? (
                <Button variant="outline" asChild>
                    <a
                        href={demoLinkHref}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Demo Link
                    </a>
                </Button>
            ) : null}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline">
                        <Filter
                            className={cn(
                                'size-3 text-gray-400',
                                hasActiveStatusFilter && 'fill-current',
                            )}
                        />
                        Filter
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-56 p-4">
                    <div className="space-y-4">
                        <h4 className="md-gray-700-weight-600">Status</h4>
                        <div className="flex flex-wrap gap-2">
                            {MEDIA_STATUS_OPTIONS.map(({ value, label }) => (
                                <Button
                                    key={value}
                                    variant={
                                        statusFilter.includes(value)
                                            ? 'default'
                                            : 'secondary'
                                    }
                                    size="sm"
                                    onClick={() => toggleStatus(value)}
                                >
                                    {label}
                                </Button>
                            ))}
                        </div>
                        <Divider />
                        <div className="flex justify-end">
                            <Button
                                variant="ghost"
                                onClick={() => onStatusFilterChange([])}
                                disabled={!hasActiveStatusFilter}
                                className="cursor-pointer"
                            >
                                <X className="size-3" />
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
            <Button
                variant="outline"
                onClick={cycleSortDirection}
                title="Sort by created date"
                aria-label="Sort by created date"
            >
                <SortIcon className="size-3 text-gray-400" /> Sort
            </Button>
        </div>
    );
}

type RowWithStatus = {
    status: MediaTableRow['status'];
    created_date: string;
};

export function filterAndSortRows<T extends RowWithStatus>(
    rows: T[],
    statusFilter: MediaStatusFilter,
    sortDirection: SortDirection,
): T[] {
    let result = rows as T[];

    if (statusFilter.length > 0) {
        result = result.filter((row) => statusFilter.includes(row.status));
    }

    if (sortDirection === 'asc' || sortDirection === 'desc') {
        result = [...result].sort((a, b) => {
            const cmp = a.created_date.localeCompare(b.created_date);
            return sortDirection === 'asc' ? cmp : -cmp;
        });
    }

    return result;
}
