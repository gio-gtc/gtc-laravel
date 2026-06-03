import type { OrderItemStatus } from '@/types';

export function buildOrderItemStatusSelectOptions(
    orderItemStatus: OrderItemStatus[],
): { value: string; label: string }[] {
    return orderItemStatus.map((s) => ({ value: s.type, label: s.type }));
}
