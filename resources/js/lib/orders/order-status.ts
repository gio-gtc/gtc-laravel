import { ClipBoardPlusIcon } from '@/components/ui/icons';
import type { OrderStatusFilterValue } from '@/types/orders-api';
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
    Cancelled: 'Cancelled',
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
    Cancelled: {
        icon: Pause,
        containerClass: 'bg-red-500',
    },
};

const DEFAULT_ORDER_STATUS_ICON: OrderStatusIconConfig = {
    icon: MessageCircleQuestion,
    containerClass: 'bg-red-500',
};

/** Normalize legacy wire spellings to icon map keys. */
function normalizeOrderStatusName(status: string): string {
    if (status === 'Canceled') {
        return 'Cancelled';
    }
    return status;
}

export function orderStatusDisplayLabel(status: string): string {
    const normalized = normalizeOrderStatusName(status);
    return (
        ORDER_STATUS_LABELS[normalized as OrderStatusFilterValue] ?? status
    );
}

export function orderStatusIconConfig(status: string): OrderStatusIconConfig {
    const normalized = normalizeOrderStatusName(status);
    return (
        ORDER_STATUS_ICON_MAP[normalized as OrderStatusFilterValue] ??
        DEFAULT_ORDER_STATUS_ICON
    );
}
