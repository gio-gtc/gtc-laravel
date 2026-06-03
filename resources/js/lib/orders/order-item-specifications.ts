import { formatShortUsDate } from '@/lib/format/date';
import type { OrderItem } from '@/types/orders-api';

export function specString(
    specs: OrderItem['specifications'],
    key: string,
): string {
    const value = specs[key];
    return typeof value === 'string' ? value.trim() : '';
}

export function orderItemDurationSeconds(
    specs: OrderItem['specifications'],
): number {
    if (typeof specs.duration_seconds === 'number') {
        return specs.duration_seconds;
    }
    return 0;
}

export function parseOrderItemDimensions(
    specs: OrderItem['specifications'],
): { width: number; height: number } {
    const raw =
        specString(specs, 'dimensions') ||
        (specString(specs, 'type').includes('×') ? specString(specs, 'type') : '');

    const match = raw.match(/(\d+)\s*[x×]\s*(\d+)/i);
    if (match) {
        return { width: Number(match[1]), height: Number(match[2]) };
    }

    const width = typeof specs.width === 'number' ? specs.width : 0;
    const height = typeof specs.height === 'number' ? specs.height : 0;

    return { width, height };
}

export function orderItemCutLabel(item: OrderItem): string {
    const menuName = item.order_menu_item?.name?.trim() ?? '';
    const specType = specString(item.specifications, 'type');
    const specDimensions = specString(item.specifications, 'dimensions');

    const parts = [menuName];
    if (specType && specType !== menuName) {
        parts.push(specType);
    }
    if (specDimensions) {
        parts.push(specDimensions);
    }

    return parts.filter(Boolean).join(' · ') || menuName || `Item ${item.id}`;
}

/** Display due date for table/venue row (M/d/yy or em dash). */
export function orderItemDueDateDisplay(item: OrderItem): string {
    if (!item.due_date) {
        return '—';
    }
    return formatShortUsDate(item.due_date);
}

export function orderItemIsci(item: OrderItem): string {
    return specString(item.specifications, 'isci');
}

export function orderItemDefaultCut(item: OrderItem): string {
    const cut = specString(item.specifications, 'cut');
    if (cut) {
        return cut;
    }
    return orderItemCutLabel(item);
}
