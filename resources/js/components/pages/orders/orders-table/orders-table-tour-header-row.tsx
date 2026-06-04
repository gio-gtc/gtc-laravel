import { FilledArrow } from '@/components/ui/icons';
import { TableCell, TableRow } from '@/components/ui/table';
import {
    useDebouncedTourPrefetch,
    useTourHeaderViewportPrefetch,
} from '@/hooks/use-tour-prefetch';
import { cn } from '@/lib/utils';
import type { TourHeader } from '@/types/orders-api';
import { Loader2 } from 'lucide-react';
import { useRef } from 'react';

type OrdersTableTourHeaderRowProps = {
    tour: TourHeader;
    isExpanded: boolean;
    isPrefetching: boolean;
    isCached: boolean;
    onToggle: () => void;
    onPrefetch: (tourId: number) => void;
};

export default function OrdersTableTourHeaderRow({
    tour,
    isExpanded,
    isPrefetching,
    isCached,
    onToggle,
    onPrefetch,
}: OrdersTableTourHeaderRowProps) {
    const rowRef = useRef<HTMLTableRowElement>(null);
    const { schedulePrefetch, cancelScheduledPrefetch } =
        useDebouncedTourPrefetch(onPrefetch);

    const prefetchEnabled =
        !isExpanded && !isCached && !isPrefetching;

    useTourHeaderViewportPrefetch(rowRef, {
        tourId: tour.id,
        enabled: prefetchEnabled,
        onPrefetch,
    });

    const handlePointerIntent = () => {
        if (!prefetchEnabled) {
            return;
        }
        schedulePrefetch(tour.id);
    };

    const handlePointerLeave = () => {
        cancelScheduledPrefetch(tour.id);
    };

    return (
        <TableRow
            ref={rowRef}
            tabIndex={0}
            className="cursor-pointer text-lg font-semibold hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={onToggle}
            onMouseEnter={handlePointerIntent}
            onMouseLeave={handlePointerLeave}
            onFocus={handlePointerIntent}
            onBlur={handlePointerLeave}
        >
            <TableCell colSpan={6} className="h-[45px] px-2 py-1">
                <div className="flex items-center gap-2.5">
                    <FilledArrow
                        className={cn(
                            'size-1.5 rotate-[-90deg] text-gray-600 transition-transform duration-150',
                            isExpanded && 'rotate-0',
                        )}
                    />
                    <span className="text-gray-700">{tour.name}</span>
                    {!isExpanded && isPrefetching && (
                        <Loader2
                            className="size-3.5 shrink-0 animate-spin text-muted-foreground"
                            aria-label="Loading orders"
                        />
                    )}
                </div>
            </TableCell>
        </TableRow>
    );
}
