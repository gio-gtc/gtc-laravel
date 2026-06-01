import { TableCell, TableRow } from '@/components/ui/table';
import { UserAvatarsStack } from '@/components/ui/user-avatars-stack';
import { getAssigneesForOrder } from '@/lib/orders/orders-filter-users';
import type { User } from '@/types';
import type { ApiOrder } from '@/types/orders-api';

type OrdersTableDemoRowProps = {
    demoOrder: ApiOrder;
    collaboratorRoster: User[];
};

export default function OrdersTableDemoRow({
    demoOrder,
    collaboratorRoster,
}: OrdersTableDemoRowProps) {
    const assignees = getAssigneesForOrder(demoOrder, collaboratorRoster);

    return (
        <TableRow className="xs-gray-500-weight-600 text-gray-500">
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
