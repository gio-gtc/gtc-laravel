import type { ModalDurationKind } from '@/components/pages/orders/slideout/switch-view/general-media/modals/modal-duration';
import type { OrderItemEncoding, OrderItemLanguage } from '@/types';

/**
 * Maps modal duration pill (`:30`, `:1:12`, etc.) to whole seconds.
 */
export function modalDurationPillToSeconds(
    label: string,
    kind: ModalDurationKind,
): number {
    void kind;
    const trimmed = label.trim();
    if (trimmed.startsWith(':')) {
        const n = Number.parseInt(trimmed.slice(1), 10);
        return Number.isFinite(n) ? Math.max(0, n) : 0;
    }
    const parts = trimmed.split(':');
    if (parts.length === 2) {
        const m = Number.parseInt(parts[0] || '0', 10);
        const s = Number.parseInt(parts[1] || '0', 10);
        if (Number.isFinite(m) && Number.isFinite(s)) {
            return Math.max(0, m * 60 + s);
        }
    }
    return 0;
}

export function languageTypeToId(
    catalog: OrderItemLanguage[],
    type: string,
): number | undefined {
    const found = catalog.find((l) => l.type === type);
    return found?.id;
}

export function encodingLabelToId(
    catalog: OrderItemEncoding[],
    label: string,
): number | undefined {
    const found = catalog.find((e) => e.type === label);
    return found?.id;
}
