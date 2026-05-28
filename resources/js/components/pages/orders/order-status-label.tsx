import { ClipBoardPlusIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import type { OrderItemStatus } from '@/types/orders-api';
import {
    CircleCheck,
    type LucideIcon,
    MessageCircleQuestion,
    Pause,
} from 'lucide-react';

const STATUS_LABELS: Record<OrderItemStatus, string> = {
    'new order': 'New Order',
    'in progress': 'In Progress',
    'client review': 'Client Review',
    complete: 'Complete',
    canceled: 'Canceled',
};

type OrderStatusIconConfig = {
    icon: LucideIcon;
    containerClass: string;
};

/** API order.status slug → icon badge (same visuals as legacy status-icon ids). */
const ORDER_STATUS_ICON_MAP: Record<OrderItemStatus, OrderStatusIconConfig> = {
    'new order': {
        icon: ClipBoardPlusIcon,
        containerClass: 'bg-green-600',
    },
    'in progress': {
        icon: MessageCircleQuestion,
        containerClass: 'bg-red-500',
    },
    'client review': {
        icon: MessageCircleQuestion,
        containerClass: 'bg-red-500',
    },
    canceled: {
        icon: Pause,
        containerClass: 'bg-red-500',
    },
    complete: {
        icon: CircleCheck,
        containerClass: 'bg-green-500',
    },
};

const DEFAULT_ORDER_STATUS_ICON: OrderStatusIconConfig =
    ORDER_STATUS_ICON_MAP['in progress'];

export function orderStatusDisplayLabel(status: OrderItemStatus): string {
    return STATUS_LABELS[status] ?? status;
}

function resolveOrderStatusIcon(
    status: OrderItemStatus,
): OrderStatusIconConfig {
    return ORDER_STATUS_ICON_MAP[status] ?? DEFAULT_ORDER_STATUS_ICON;
}

export default function OrderStatusLabel({
    status,
    className,
    iconClassName,
}: {
    status: OrderItemStatus;
    className?: string;
    iconClassName?: string;
}) {
    const { icon: Icon, containerClass } = resolveOrderStatusIcon(status);

    return (
        <div
            title={orderStatusDisplayLabel(status)}
            className={cn(
                'flex h-[24px] w-[24px] items-center justify-center rounded-md',
                containerClass,
                className,
            )}
        >
            <Icon className={cn('size-4 text-white', iconClassName)} />
        </div>
    );
}
