import { cn } from '@/lib/utils';
import type { OrderItemStatus } from '@/types';

export type VenueItemStatusType = OrderItemStatus['type'];

export function VenueItemStatusBadge({
    status,
    className,
}: {
    status: VenueItemStatusType;
    className?: string;
}) {
    const baseClasses =
        'xs-gray-700-weight-600 inline-flex items-center rounded-full border-1 border-solid px-1.5 py-0.5 text-nowrap';

    let colorClasses = '';

    switch (status) {
        case 'Still in Cart':
        case 'Client Review':
            colorClasses = 'border-yellow-400 bg-yellow-50';
            break;
        case 'In Production':
        case 'Out for Delivery':
            colorClasses = 'border-green-400 bg-green-50';
            break;
        case 'Cancelled':
        case 'Revision Requested':
            colorClasses = 'border-gray-400 bg-gray-50';
            break;
        case 'Unassigned':
            colorClasses = 'border-red-400 bg-red-50';
            break;
    }

    return (
        <span className={cn(baseClasses, colorClasses, className)}>
            {status}
        </span>
    );
}
