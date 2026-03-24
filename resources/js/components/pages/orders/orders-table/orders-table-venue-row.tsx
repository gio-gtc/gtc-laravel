import { TableCell, TableRow } from '@/components/ui/table';
import { UserAvatar } from '@/components/ui/user-avatar';
import { UserAvatarsStack } from '@/components/ui/user-avatars-stack';
import { cn } from '@/lib/utils';
import { type Tour, type User } from '@/types';
import { ChevronRight } from 'lucide-react';
import StatusIconGroup from '../status-icon';
import { type OrderGroupVenueItem } from './orders-table-group-helpers';

type OrdersTableVenueRowProps = {
    order: Tour;
    venueItem: OrderGroupVenueItem;
    venueIsSelected: boolean;
    client: User | undefined;
    assignees: User[];
    formatDate: (dateString: string) => string;
    onVenueRowClick: (orderVenueId: number, orderId: number) => void;
    onOpenSlideout: (payload: {
        order: Tour;
        venueItem: OrderGroupVenueItem;
    }) => void;
};

export default function OrdersTableVenueRow({
    order,
    venueItem,
    venueIsSelected,
    client,
    assignees,
    formatDate,
    onVenueRowClick,
    onOpenSlideout,
}: OrdersTableVenueRowProps) {
    const v = venueItem.venue;

    return (
        <TableRow
            data-state={venueIsSelected && 'selected'}
            className={cn(
                'xs-gray-500-weight-600 cursor-pointer hover:bg-gray-100',
                venueIsSelected && 'data-[state=selected]:bg-red-100',
            )}
            onClick={() => onVenueRowClick(venueItem.orderVenue.id, order.id)}
        >
            <TableCell className={cn('px-2 py-0.5 text-gray-500')}>
                <div className="flex items-center justify-between">
                    <span className="pl-2">
                        {v?.city || ''}, {v?.state || ''}
                    </span>
                    <ChevronRight
                        className="h-2.5 w-2.5 cursor-pointer text-gray-400 hover:text-gray-600"
                        strokeWidth={3}
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenSlideout({ order, venueItem });
                        }}
                    />
                </div>
            </TableCell>
            <TableCell className={cn('px-2 py-0.5 text-gray-500')}>
                {v?.name || ''}
            </TableCell>
            <TableCell className={cn('px-2 py-0.5 text-gray-500')}>
                {formatDate(venueItem.orderVenue.start_date)}
            </TableCell>
            <TableCell className={cn('px-2 py-0.5 text-gray-500')}>
                {client && <UserAvatar user={client} />}
            </TableCell>
            <TableCell className={cn('px-2 py-0.5 text-gray-500')}>
                <UserAvatarsStack users={assignees} />
            </TableCell>
            <TableCell className="flex gap-0.5 px-2 py-[1px] text-gray-500">
                <StatusIconGroup status={venueItem.orderVenue.status} />
            </TableCell>
        </TableRow>
    );
}
