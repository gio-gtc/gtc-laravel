import { Image, MessageCircleQuestion, Volume2, type LucideIcon } from 'lucide-react';
import type { OrderTag } from '@/types/orders-api';

export type OrderTagIconConfig = {
    icon: LucideIcon;
    containerClass: string;
};

/** Matches legacy awaiting-assets-icons styling for Art / Audio. */
export const ORDER_TAG_ICON_MAP: Record<OrderTag, OrderTagIconConfig> = {
    Audio: {
        icon: Volume2,
        containerClass: 'bg-yellow-500',
    },
    Art: {
        icon: Image,
        containerClass: 'bg-yellow-500',
    },
};

const DEFAULT_ORDER_TAG_ICON: OrderTagIconConfig = {
    icon: MessageCircleQuestion,
    containerClass: 'bg-red-500',
};

export function orderTagIconConfig(tag: string): OrderTagIconConfig {
    return ORDER_TAG_ICON_MAP[tag as OrderTag] ?? DEFAULT_ORDER_TAG_ICON;
}
