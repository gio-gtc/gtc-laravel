import { ClipBoardPlusIcon } from '@/components/ui/icons';
import type { OrderStatus } from '@/types/orders-api';
import {
    CircleCheck,
    type LucideIcon,
    MessageCircleQuestion,
    Pause,
} from 'lucide-react';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
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

const ORDER_STATUS_ICON_MAP: Record<OrderStatus, OrderStatusIconConfig> = {
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

export function orderStatusDisplayLabel(status: string): string {
    return ORDER_STATUS_LABELS[status as OrderStatus] ?? status;
}

export function orderStatusIconConfig(status: string): OrderStatusIconConfig {
    return (
        ORDER_STATUS_ICON_MAP[status as OrderStatus] ?? DEFAULT_ORDER_STATUS_ICON
    );
}
