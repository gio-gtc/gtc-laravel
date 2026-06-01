import { TableCell, TableRow } from '@/components/ui/table';
import { UserAvatar } from '@/components/ui/user-avatar';
import { UserAvatarsStack } from '@/components/ui/user-avatars-stack';
import {
    getAssigneesForOrder,
    resolveClientForOrder,
} from '@/lib/orders/orders-filter-users';
import { cn } from '@/lib/utils';
import type { User } from '@/types';
import type { ApiOrder } from '@/types/orders-api';
import AwaitingAssetsIconGroup from '../awaiting-assets-icons';
import OrderStatusLabel from '../order-status-label';

type OrdersTableOrderRowProps = {
    order: ApiOrder;
    orderIsSelected: boolean;
    clientRoster: User[];
    collaboratorRoster: User[];
    formatDate: (dateString: string) => string;
    onOrderRowClick: (orderId: number) => void;
};

export default function OrdersTableOrderRow({
    order,
    orderIsSelected,
    clientRoster,
    collaboratorRoster,
    formatDate,
    onOrderRowClick,
}: OrdersTableOrderRowProps) {
    const venue = order.venue;
    const client = resolveClientForOrder(order, clientRoster);
    const assignees = getAssigneesForOrder(order, collaboratorRoster);
    const region =
        venue?.city && venue?.state
            ? `${venue.city}, ${venue.state}`
            : venue?.city || venue?.state || '';

    return (
        <TableRow
            data-state={orderIsSelected && 'selected'}
            className={cn(
                'xs-gray-500-weight-600 cursor-pointer hover:bg-gray-100',
                orderIsSelected && 'data-[state=selected]:bg-red-100',
            )}
            onClick={() => onOrderRowClick(order.id)}
        >
            <TableCell className={cn('px-2 py-0.5 text-gray-500')}>
                <span className="truncate pl-2">{region}</span>
            </TableCell>

            <TableCell className={cn('truncate px-2 py-0.5 text-gray-500')}>
                {venue?.name ?? ''}
            </TableCell>

            <TableCell className={cn('truncate px-2 py-0.5 text-gray-500')}>
                {formatDate(order.due_date)}
            </TableCell>

            <TableCell className={cn('px-2 py-0.5 text-gray-500')}>
                {client && <UserAvatar user={client} />}
            </TableCell>

            <TableCell className={cn('px-2 py-0.5 text-gray-500')}>
                <UserAvatarsStack users={assignees} />
            </TableCell>

            <TableCell className="flex items-center gap-1 px-2 py-0.5">
                <OrderStatusLabel status={order.status} />
                <AwaitingAssetsIconGroup tags={order.awaiting_assets} />
            </TableCell>
        </TableRow>
    );
}
