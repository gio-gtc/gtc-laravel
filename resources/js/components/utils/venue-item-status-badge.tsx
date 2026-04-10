import { cn } from '@/lib/utils';
import type { VenueItemStatus } from '@/types';

export type VenueItemStatusType = VenueItemStatus['type'];

export function VenueItemStatusBadge({
    status,
    className,
}: {
    status: VenueItemStatusType;
    className?: string;
}) {
    const baseClasses =
        'inline-flex items-center rounded-full border-2 border-solid px-2.5 py-0.5 text-xs font-medium';

    let colorClasses = '';

    switch (status) {
        case 'Still in Cart':
        case 'Client Review':
            colorClasses = 'border-yellow-400 bg-yellow-50';
            break;
        case 'In Production':
        case 'Out for Delivery':
            colorClasses = 'border-green-400 bg-green-50 text-green-700';
            break;
        case 'Cancelled':
        case 'Revision Requested':
            colorClasses = 'border-gray-400 bg-gray-50 text-gray-700';
            break;
        case 'Unassigned':
            colorClasses = 'border-red-400 bg-red-50 text-red-700';
            break;
    }

    return (
        <span className={cn(baseClasses, colorClasses, className)}>
            {status}
        </span>
    );
}
