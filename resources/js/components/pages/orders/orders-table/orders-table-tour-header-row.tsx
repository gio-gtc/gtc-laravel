import { FilledArrow } from '@/components/ui/icons';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { TourHeader } from '@/types/orders-api';

type OrdersTableTourHeaderRowProps = {
    tour: TourHeader;
    isExpanded: boolean;
    onToggle: () => void;
};

export default function OrdersTableTourHeaderRow({
    tour,
    isExpanded,
    onToggle,
}: OrdersTableTourHeaderRowProps) {
    return (
        <TableRow
            tabIndex={0}
            className="cursor-pointer text-lg font-semibold hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={onToggle}
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
                </div>
            </TableCell>
        </TableRow>
    );
}
