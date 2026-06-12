import { TableCell, TableRow } from '@/components/ui/table';
import { UserAvatar } from '@/components/ui/user-avatar';
import { UserAvatarsStack } from '@/components/ui/user-avatars-stack';
import {
    indexOrderAssigneesToUsers,
    resolveClientForIndexOrder,
} from '@/lib/orders/index-order-helpers';
import { cn } from '@/lib/utils';
import type { User } from '@/types';
import type { IndexOrder } from '@/types/orders-api';
import { ChevronRight } from 'lucide-react';
import { resolveOrderBadges } from '@/lib/orders/resolve-order-badges';
import OrderBadgesRow from '../order-badges-row';

type OrdersTableOrderRowProps = {
    order: IndexOrder;
    orderIsSelected: boolean;
    clientRoster: User[];
    collaboratorRoster: User[];
    formatDate: (dateString: string) => string;
    onOrderRowSelect: (orderId: number) => void;
    onOpenSlideout: (orderId: number) => void;
};

export default function OrdersTableOrderRow({
    order,
    orderIsSelected,
    clientRoster,
    collaboratorRoster,
    formatDate,
    onOrderRowSelect,
    onOpenSlideout,
}: OrdersTableOrderRowProps) {
    const venue = order.venue;
    const client = resolveClientForIndexOrder(order, clientRoster);
    const assignees = indexOrderAssigneesToUsers(order, collaboratorRoster);
    const region =
        venue?.city && venue?.state
            ? `${venue.city}, ${venue.state}`
            : venue?.city || venue?.state || '';
    const badges = resolveOrderBadges(order);

    return (
        <TableRow
            data-state={orderIsSelected && 'selected'}
            className={cn(
                'xs-gray-500-weight-600 cursor-pointer hover:bg-gray-100',
                orderIsSelected && 'data-[state=selected]:bg-red-100',
            )}
            onClick={() => onOrderRowSelect(order.id)}
        >
            <TableCell className={cn('px-2 py-0.5 text-gray-500')}>
                <div className="flex items-center justify-between">
                    <span className="truncate pl-2">{region}</span>
                    <ChevronRight
                        className="h-2.5 w-2.5 shrink-0 cursor-pointer text-gray-400 hover:text-gray-600"
                        strokeWidth={3}
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenSlideout(order.id);
                        }}
                    />
                </div>
            </TableCell>

            <TableCell className={cn('truncate px-2 py-0.5 text-gray-500')}>
                {venue?.name ?? ''}
            </TableCell>

            <TableCell className={cn('truncate px-2 py-0.5 text-gray-500')}>
                {order.due_date ? formatDate(order.due_date) : '—'}
            </TableCell>

            <TableCell className={cn('px-2 py-0.5 text-gray-500')}>
                {client && <UserAvatar user={client} />}
            </TableCell>

            <TableCell className={cn('px-2 py-0.5 text-gray-500')}>
                <UserAvatarsStack users={assignees} />
            </TableCell>

            <TableCell className="flex items-center gap-1 px-2 py-0.5">
                <OrderBadgesRow
                    statuses={badges.statuses}
                    tags={order.tags}
                    tagIconClassName="size-3"
                    statusIconClassName="size-4"
                />
            </TableCell>
        </TableRow>
    );
}
