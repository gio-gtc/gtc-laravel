import { TableCell, TableRow } from '@/components/ui/table';
import { UserAvatarsStack } from '@/components/ui/user-avatars-stack';
import { resolveAssigneesForOrder } from '@/lib/orders/orders-filter-users';
import { resolveOrderBadges } from '@/lib/orders/resolve-order-badges';
import { cn } from '@/lib/utils';
import type { User } from '@/types';
import type { IndexOrder } from '@/types/orders-api';
import { ChevronRight } from 'lucide-react';
import OrderBadgesRow from '../order-badges-row';

type OrdersTableDemoRowProps = {
    demoOrder: IndexOrder;
    orderIsSelected: boolean;
    collaboratorRoster: User[];
    onOrderRowSelect: (orderId: number) => void;
    onOpenSlideout: (orderId: number) => void;
};

export default function OrdersTableDemoRow({
    demoOrder,
    orderIsSelected,
    collaboratorRoster,
    onOrderRowSelect,
    onOpenSlideout,
}: OrdersTableDemoRowProps) {
    const assignees = resolveAssigneesForOrder(demoOrder, collaboratorRoster);
    const badges = resolveOrderBadges(demoOrder);

    return (
        <TableRow
            data-state={orderIsSelected && 'selected'}
            className={cn(
                'xs-gray-500-weight-600 cursor-pointer text-gray-500 hover:bg-gray-100',
                orderIsSelected && 'data-[state=selected]:bg-red-100',
            )}
            onClick={() => onOrderRowSelect(demoOrder.id)}
        >
            <TableCell className="px-2 py-0.5">
                <div className="flex items-center justify-between">
                    <span className="pl-2 leading-[24px]">Demo</span>
                    <ChevronRight
                        className="h-2.5 w-2.5 shrink-0 cursor-pointer text-gray-400 hover:text-gray-600"
                        strokeWidth={3}
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenSlideout(demoOrder.id);
                        }}
                    />
                </div>
            </TableCell>
            <TableCell className="px-2 py-0.5" />
            <TableCell className="px-2 py-0.5" />
            <TableCell className="px-2 py-0.5" />
            <TableCell className="px-2 py-0.5">
                {assignees.length > 0 && <UserAvatarsStack users={assignees} />}
            </TableCell>
            <TableCell className="flex items-center gap-1 px-2 py-0.5">
                <OrderBadgesRow
                    statuses={badges.statuses}
                    tags={badges.tags}
                    tagIconClassName="size-3"
                    statusIconClassName="size-4"
                />
            </TableCell>
        </TableRow>
    );
}
