import { TableCell, TableRow } from '@/components/ui/table';
import { UserAvatarsStack } from '@/components/ui/user-avatars-stack';
import { getAssigneesForOrder } from '@/lib/orders/orders-filter-users';
import { cn } from '@/lib/utils';
import type { User } from '@/types';
import type { ApiOrder } from '@/types/orders-api';

type OrdersTableDemoRowProps = {
    demoOrder: ApiOrder;
    orderIsSelected: boolean;
    collaboratorRoster: User[];
    onOrderRowClick: (orderId: number) => void;
};

export default function OrdersTableDemoRow({
    demoOrder,
    orderIsSelected,
    collaboratorRoster,
    onOrderRowClick,
}: OrdersTableDemoRowProps) {
    const assignees = getAssigneesForOrder(demoOrder, collaboratorRoster);

    return (
        <TableRow
            data-state={orderIsSelected && 'selected'}
            className={cn(
                'xs-gray-500-weight-600 cursor-pointer text-gray-500 hover:bg-gray-100',
                orderIsSelected && 'data-[state=selected]:bg-red-100',
            )}
            onClick={() => onOrderRowClick(demoOrder.id)}
        >
            <TableCell className="px-2 py-0.5">
                <div className="pl-2 leading-[24px]">Demo</div>
            </TableCell>
            <TableCell className="px-2 py-0.5" />
            <TableCell className="px-2 py-0.5" />
            <TableCell className="px-2 py-0.5" />
            <TableCell className="px-2 py-0.5">
                {assignees.length > 0 && <UserAvatarsStack users={assignees} />}
            </TableCell>
            <TableCell className="px-2 py-0.5" />
        </TableRow>
    );
}
