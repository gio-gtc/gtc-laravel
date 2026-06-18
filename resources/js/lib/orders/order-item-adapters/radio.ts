import type { AddAudioFormValues } from '@/components/pages/orders/slideout/switch-view/general-media/modals/add-audio-modal';
import {
    durationWireFromNumericInput,
    durationWireFromPill,
    durationWireFromSpecValue,
} from '@/lib/orders/broadcast-spec-wire';
import { ORDER_MENU_CATEGORY_QUADRANTS } from '@/lib/orders/order-menu-categories';
import {
    initialAssetTrackingFromCatalogTags,
    missingAssetTagsFromTrackingMap,
} from '@/lib/orders/order-item-specifications';
import { dueDateIso } from '@/lib/orders/slideout/legacy-venue-row-to-api-item';
import type { StoreOrderItemPayload } from '@/lib/orders/slideout/legacy-venue-row-to-api-item';
import { formatShortUsDate } from '@/lib/format/date';
import type { OrderItemsRadioRow } from '@/types';
import type { ApiOrder } from '@/types/orders-api';
import type {
    OrderItemCreateAdapter,
    OrderItemCreateDraft,
    OrderItemExpandContext,
    OrderItemUpdateAdapter,
} from './types';

function buildRadioSpecifications(parts: {
    type: string;
    cut: string;
    duration_seconds: string;
    language: string;
}): Record<string, unknown> {
    return {
        type: parts.type,
        cut: parts.cut,
        duration_seconds: parts.duration_seconds,
        language: parts.language,
    };
}

export function radioRowDurationWire(row: OrderItemsRadioRow): string {
    if (typeof row.duration_seconds === 'string') {
        return row.duration_seconds.trim();
    }
    return durationWireFromNumericInput(row.duration_seconds);
}

function radioUpdateSpecifications(
    row: OrderItemsRadioRow,
): Record<string, unknown> {
    return buildRadioSpecifications({
        type: row.spot_type,
        cut: row.cut,
        duration_seconds: radioRowDurationWire(row),
        language: row.language ?? '',
    });
}

export function validateRadioRowSpecifications(
    row: OrderItemsRadioRow,
): { ok: true } | { ok: false; message: string } {
    if (!row.spot_type?.trim() || !row.cut?.trim()) {
        return { ok: false, message: 'Type and cut are required.' };
    }
    if (!row.language?.trim()) {
        return { ok: false, message: 'Language is required.' };
    }
    return { ok: true };
}

export function radioRowToUpdatePayload(
    row: OrderItemsRadioRow,
    order: ApiOrder,
): Pick<StoreOrderItemPayload, 'due_date' | 'specifications'> {
    return {
        due_date: dueDateIso(order, row),
        specifications: radioUpdateSpecifications(row),
    };
}

export const radioUpdateAdapter: OrderItemUpdateAdapter<OrderItemsRadioRow> = {
    categoryId: ORDER_MENU_CATEGORY_QUADRANTS.radio,
    rowToFullBulkPatch: (row, order) => ({
        due_date: dueDateIso(order, row),
        specifications: radioUpdateSpecifications(row),
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

export function expandRadioCreateDrafts(
    form: AddAudioFormValues,
    ctx: OrderItemExpandContext,
): OrderItemCreateDraft[] {
    const drafts: OrderItemCreateDraft[] = [];

    if (
        !form.type ||
        form.cuts.length === 0 ||
        form.duration.length === 0 ||
        form.language.length === 0
    ) {
        return drafts;
    }

    for (const cut of form.cuts) {
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
                    specifications: buildRadioSpecifications({
                        type: form.type,
                        cut,
                        duration_seconds: durationWireFromPill(dur),
                        language,
                    }),
                });
            }
        }
    }

    return drafts;
}

export function draftToPendingRadioRow(
    draft: OrderItemCreateDraft,
    tourVenueId: number,
    catalogTags?: string[],
): OrderItemsRadioRow {
    const specs = draft.specifications;
    const spotType = String(specs.type ?? 'Generic');
    const cut = String(specs.cut ?? '');
    const durationWire = durationWireFromSpecValue(specs.duration_seconds);
    const assetTracking = initialAssetTrackingFromCatalogTags(catalogTags);
    const missingAssetTags = missingAssetTagsFromTrackingMap(assetTracking);

    return {
        id: draft.pendingId,
        tour_venue_id: tourVenueId,
        type: 'radio',
        created_date: new Date().toISOString(),
        dueDate: formatShortUsDate(draft.due_date),
        spot_type: spotType as OrderItemsRadioRow['spot_type'],
        cut: cut as OrderItemsRadioRow['cut'],
        isci: 'Adding…',
        duration_seconds: durationWire,
        status_id: 1,
        language:
            typeof specs.language === 'string' ? specs.language : undefined,
        asset_tracking: assetTracking,
        missingAssetTags,
        is_pending: true,
    };
}

export const radioCreateAdapter: OrderItemCreateAdapter<AddAudioFormValues> = {
    categoryId: ORDER_MENU_CATEGORY_QUADRANTS.radio,
    expandDrafts: expandRadioCreateDrafts,
    toStorePayload: (draft) => ({
        order_menu_item_id: draft.order_menu_item_id,
        due_date: draft.due_date,
        specifications: draft.specifications,
    }),
};
