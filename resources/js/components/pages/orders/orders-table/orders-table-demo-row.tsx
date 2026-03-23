import {
    TableCell,
    TableRow,
} from '@/components/ui/table';
import { UserAvatar } from '@/components/ui/user-avatar';
import { UserAvatarsStack } from '@/components/ui/user-avatars-stack';
import { type Tour, type User } from '@/types';
import { ChevronRight } from 'lucide-react';
import { type OrderGroupVenueItem } from './orders-table-group-helpers';

type OrdersTableDemoRowProps = {
    order: Tour;
    demoItem: OrderGroupVenueItem;
    owner: User | undefined;
    assignees: User[];
    onOpenSlideout: (payload: {
        order: Tour;
        venueItem: OrderGroupVenueItem;
    }) => void;
};

export default function OrdersTableDemoRow({
    order,
    demoItem,
    owner,
    assignees,
    onOpenSlideout,
}: OrdersTableDemoRowProps) {
    return (
        <TableRow
            className="xs-gray-500-weight-600 cursor-pointer hover:bg-gray-100"
            onClick={() => onOpenSlideout({ order, venueItem: demoItem })}
        >
            <TableCell className="px-2 py-0.5 text-gray-500">
                <div className="flex items-center justify-between">
                    <span className="pl-2">Demo</span>
                    <ChevronRight
                        className="h-2.5 w-2.5 cursor-pointer text-gray-400 hover:text-gray-600"
                        strokeWidth={3}
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenSlideout({ order, venueItem: demoItem });
                        }}
                    />
                </div>
            </TableCell>
            <TableCell className="px-2 py-0.5 text-gray-500"></TableCell>
            <TableCell className="px-2 py-0.5 text-gray-500"></TableCell>
            <TableCell className="px-2 py-0.5 text-gray-500">
                {owner && <UserAvatar user={owner} />}
            </TableCell>
            <TableCell className="px-2 py-0.5 text-gray-500">
                {assignees.length > 0 && (
                    <UserAvatarsStack users={assignees} />
                )}
            </TableCell>
            <TableCell className="px-2 py-[1px] text-gray-500" />
        </TableRow>
    );
}
