import type { AddSocialVideoFormValues } from '@/components/pages/orders/slideout/switch-view/general-media/modals/add-social-video-modal';
import {
    durationWireFromNumericInput,
    durationWireFromPill,
    durationWireFromSpecValue,
} from '@/lib/orders/broadcast-spec-wire';
import { ORDER_MENU_CATEGORY_QUADRANTS } from '@/lib/orders/order-menu-categories';
import { dueDateIso } from '@/lib/orders/slideout/legacy-venue-row-to-api-item';
import type { StoreOrderItemPayload } from '@/lib/orders/slideout/legacy-venue-row-to-api-item';
import type { OrderItemsSocialRow } from '@/types';
import type { ApiOrder } from '@/types/orders-api';
import { formatShortUsDate } from '@/lib/format/date';
import type {
    OrderItemCreateAdapter,
    OrderItemCreateDraft,
    OrderItemExpandContext,
    OrderItemUpdateAdapter,
} from './types';

function buildSocialSpecifications(parts: {
    type: string;
    cut: string;
    card_holder: string;
    duration_seconds: string;
    language: string;
}): Record<string, unknown> {
    return {
        type: parts.type,
        cut: parts.cut,
        card_holder: parts.card_holder,
        duration_seconds: parts.duration_seconds,
        language: parts.language,
    };
}

export function socialRowDurationWire(row: OrderItemsSocialRow): string {
    if (typeof row.duration_seconds === 'string') {
        return row.duration_seconds.trim();
    }
    return durationWireFromNumericInput(row.duration_seconds);
}

function socialUpdateSpecifications(
    row: OrderItemsSocialRow,
): Record<string, unknown> {
    return buildSocialSpecifications({
        type: row.spot_type,
        cut: row.cut,
        card_holder: row.card_holder?.trim() ?? '',
        duration_seconds: socialRowDurationWire(row),
        language: row.language ?? '',
    });
}

export function validateSocialRowSpecifications(
    row: OrderItemsSocialRow,
): { ok: true } | { ok: false; message: string } {
    if (!row.card_holder?.trim()) {
        return { ok: false, message: 'Card holder is required.' };
    }
    if (!row.spot_type?.trim() || !row.cut?.trim()) {
        return { ok: false, message: 'Type and cut are required.' };
    }
    return { ok: true };
}

export function socialRowToUpdatePayload(
    row: OrderItemsSocialRow,
    order: ApiOrder,
): Pick<StoreOrderItemPayload, 'due_date' | 'specifications'> {
    return {
        due_date: dueDateIso(order, row),
        specifications: socialUpdateSpecifications(row),
    };
}

export const socialUpdateAdapter: OrderItemUpdateAdapter<OrderItemsSocialRow> = {
    categoryId: ORDER_MENU_CATEGORY_QUADRANTS.social,
    rowToFullBulkPatch: (row, order) => ({
        due_date: dueDateIso(order, row),
        specifications: socialUpdateSpecifications(row),
    }),
    durationPatch: (wire) => ({
        specifications: {
            duration_seconds:
                typeof wire === 'string'
                    ? wire.trim()
                    : durationWireFromNumericInput(wire),
        },
    }),
    statusPatch: (statusId) => ({
        order_item_status_id: statusId,
    }),
    typePatch: (type) => ({
        specifications: { type: type.trim() },
    }),
    cutPatch: (cut) => ({
        specifications: { cut: cut.trim() },
    }),
};

export function expandSocialCreateDrafts(
    form: AddSocialVideoFormValues,
    ctx: OrderItemExpandContext,
): OrderItemCreateDraft[] {
    const drafts: OrderItemCreateDraft[] = [];

    if (
        form.type.length === 0 ||
        form.cuts.length === 0 ||
        form.cardHolder.length === 0 ||
        form.duration.length === 0 ||
        form.language.length === 0
    ) {
        return drafts;
    }

    for (const layout of form.type) {
        for (const cut of form.cuts) {
            for (const holder of form.cardHolder) {
                const cardHolder = holder.trim();
                if (!cardHolder) {
                    continue;
                }
                for (const dur of form.duration) {
                    for (const lang of form.language) {
                        const language = lang.trim();
                        if (!language) {
                            continue;
                        }
                        drafts.push({
                            pendingId: ctx.nextPendingId(),
                            order_menu_item_id: ctx.orderMenuItemId,
                            due_date: ctx.dueDate,
                            specifications: buildSocialSpecifications({
                                type: layout,
                                cut,
                                card_holder: cardHolder,
                                duration_seconds: durationWireFromPill(dur),
                                language,
                            }),
                        });
                    }
                }
            }
        }
    }

    return drafts;
}

export function draftToPendingSocialRow(
    draft: OrderItemCreateDraft,
    tourVenueId: number,
): OrderItemsSocialRow {
    const specs = draft.specifications;
    const spotType = String(specs.type ?? 'Social - 16:9');
    const cut = String(specs.cut ?? 'On Sale Now');
    const durationWire = durationWireFromSpecValue(specs.duration_seconds);
    const cardHolder =
        typeof specs.card_holder === 'string' ? specs.card_holder.trim() : '';

    return {
        id: draft.pendingId,
        tour_venue_id: tourVenueId,
        type: 'social',
        created_date: new Date().toISOString(),
        dueDate: formatShortUsDate(draft.due_date),
        spot_type: spotType as OrderItemsSocialRow['spot_type'],
        cut: cut as OrderItemsSocialRow['cut'],
        isci: 'Adding…',
        duration_seconds: durationWire,
        status_id: 1,
        language:
            typeof specs.language === 'string' ? specs.language : undefined,
        card_holder: cardHolder || undefined,
        is_pending: true,
    };
}

export const socialCreateAdapter: OrderItemCreateAdapter<AddSocialVideoFormValues> =
    {
        categoryId: ORDER_MENU_CATEGORY_QUADRANTS.social,
        expandDrafts: expandSocialCreateDrafts,
        toStorePayload: (draft) => ({
            order_menu_item_id: draft.order_menu_item_id,
            due_date: draft.due_date,
            specifications: draft.specifications,
        }),
    };
