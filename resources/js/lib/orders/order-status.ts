import { ClipBoardPlusIcon } from '@/components/ui/icons';
import type {
    ApiOrderWireStatus,
    OrderStatus,
    OrderStatusFilterValue,
} from '@/types/orders-api';
import {
    CircleCheck,
    type LucideIcon,
    MessageCircleQuestion,
    Pause,
} from 'lucide-react';

export const ORDER_STATUS_LABELS: Record<OrderStatusFilterValue, string> = {
    'New Order': 'New Order',
    'In Progress': 'In Progress',
    'Client Review': 'Client Review',
    Complete: 'Complete',
    Canceled: 'Canceled',
};

type OrderStatusIconConfig = {
    icon: LucideIcon;
    containerClass: string;
};

const ORDER_STATUS_ICON_MAP: Record<
    OrderStatusFilterValue,
    OrderStatusIconConfig
> = {
    'New Order': {
        icon: ClipBoardPlusIcon,
        containerClass: 'bg-green-600',
    },
    'In Progress': {
        icon: MessageCircleQuestion,
        containerClass: 'bg-red-500',
    },
    'Client Review': {
        icon: MessageCircleQuestion,
        containerClass: 'bg-red-500',
    },
    Complete: {
        icon: CircleCheck,
        containerClass: 'bg-green-500',
    },
    Canceled: {
        icon: Pause,
        containerClass: 'bg-red-500',
    },
};

const DEFAULT_ORDER_STATUS_ICON: OrderStatusIconConfig = {
    icon: MessageCircleQuestion,
    containerClass: 'bg-brand-gtc-red',
};

/** Whether /orders table should render a container status icon. */
export function indexOrderShowsStatusIcon(
    status: ApiOrderWireStatus,
): status is OrderStatus {
    return status !== 'Still In Cart';
}

export function orderStatusDisplayLabel(status: string): string {
    return ORDER_STATUS_LABELS[status as OrderStatusFilterValue] ?? status;
}

export function orderStatusIconConfig(status: string): OrderStatusIconConfig {
    return (
        ORDER_STATUS_ICON_MAP[status as OrderStatusFilterValue] ??
        DEFAULT_ORDER_STATUS_ICON
    );
}
