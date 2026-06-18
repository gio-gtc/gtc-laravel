import type { AddBroadcastStreamingFormValues } from '@/components/pages/orders/slideout/switch-view/general-media/modals/add-broadcast-streaming-modal';
import {
    assertInternationalDuration,
    durationWireFromNumericInput,
    durationWireFromPill,
    durationWireFromSpecValue,
    encodingLabelsFromWire,
    encodingWireFromRowLabel,
    normalizeEncodingLabels,
    primaryEncodingLabel,
} from '@/lib/orders/broadcast-spec-wire';
import { ORDER_MENU_CATEGORY_QUADRANTS } from '@/lib/orders/order-menu-categories';
import {
    initialAssetTrackingFromCatalogTags,
    missingAssetTagsFromTrackingMap,
} from '@/lib/orders/order-item-specifications';
import { dueDateIso } from '@/lib/orders/slideout/legacy-venue-row-to-api-item';
import type { StoreOrderItemPayload } from '@/lib/orders/slideout/legacy-venue-row-to-api-item';
import type { OrderItemsBroadcastRow } from '@/types';
import type { ApiOrder } from '@/types/orders-api';
import { formatShortUsDate } from '@/lib/format/date';
import type {
    OrderItemCreateAdapter,
    OrderItemCreateDraft,
    OrderItemExpandContext,
    OrderItemUpdateAdapter,
} from './types';

function encodingWireFromFormEncoding(
    enc: AddBroadcastStreamingFormValues['encodings'][number],
): string[] {
    return normalizeEncodingLabels(enc.encoding);
}

function buildBroadcastSpecifications(
    form: AddBroadcastStreamingFormValues,
    enc: AddBroadcastStreamingFormValues['encodings'][number],
): Record<string, unknown> {
    const durationWire = durationWireFromPill(enc.duration);
    const encoding = encodingWireFromFormEncoding(enc);

    const specs: Record<string, unknown> = {
        type: form.type,
        cut: enc.cut,
        duration_seconds: durationWire,
        language: enc.language,
    };

    if (encoding.length > 0) {
        specs.encoding = encoding;
    }

    return specs;
}

function broadcastRowDurationWire(row: OrderItemsBroadcastRow): string {
    if (typeof row.duration_seconds === 'string') {
        return row.duration_seconds.trim();
    }
    return durationWireFromNumericInput(row.duration_seconds);
}

function broadcastRowEncodingWire(row: OrderItemsBroadcastRow): string[] {
    if (Array.isArray(row.encoding) && row.encoding.length > 0) {
        return row.encoding;
    }
    if (row.encoding_label?.trim()) {
        return encodingWireFromRowLabel(row.encoding_label);
    }
    return [];
}

function broadcastUpdateSpecifications(
    row: OrderItemsBroadcastRow,
): Record<string, unknown> {
    const durationWire = broadcastRowDurationWire(row);
    const encoding = broadcastRowEncodingWire(row);

    const specs: Record<string, unknown> = {
        type: row.spot_type,
        cut: row.cut,
        duration_seconds: durationWire,
        language: row.language ?? '',
    };

    if (encoding.length > 0) {
        specs.encoding = encoding;
    }

    return specs;
}

export function validateBroadcastRowSpecifications(
    row: OrderItemsBroadcastRow,
): { ok: true } | { ok: false; message: string } {
    const durationWire = broadcastRowDurationWire(row);
    return assertInternationalDuration(
        durationWire,
        row.spot_type,
        row.cut,
    );
}

export function broadcastRowToUpdatePayload(
    row: OrderItemsBroadcastRow,
    order: ApiOrder,
): Pick<StoreOrderItemPayload, 'due_date' | 'specifications'> {
    return {
        due_date: dueDateIso(order, row),
        specifications: broadcastUpdateSpecifications(row),
    };
}

export const broadcastUpdateAdapter: OrderItemUpdateAdapter<OrderItemsBroadcastRow> =
    {
        categoryId: ORDER_MENU_CATEGORY_QUADRANTS.broadcast,
        rowToFullBulkPatch: (row, order) => ({
            due_date: dueDateIso(order, row),
            specifications: broadcastUpdateSpecifications(row),
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

export function expandBroadcastCreateDrafts(
    form: AddBroadcastStreamingFormValues,
    ctx: OrderItemExpandContext,
): OrderItemCreateDraft[] {
    const drafts: OrderItemCreateDraft[] = [];

    for (const enc of form.encodings) {
        if (normalizeEncodingLabels(enc.encoding).length === 0) {
            continue;
        }

        const durationWire = durationWireFromPill(enc.duration);
        const intlCheck = assertInternationalDuration(
            durationWire,
            form.type,
            enc.cut,
        );
        if (!intlCheck.ok) {
            continue;
        }

        drafts.push({
            pendingId: ctx.nextPendingId(),
            order_menu_item_id: ctx.orderMenuItemId,
            due_date: ctx.dueDate,
            specifications: buildBroadcastSpecifications(form, enc),
        });
    }

    return drafts;
}

export function draftToPendingBroadcastRow(
    draft: OrderItemCreateDraft,
    tourVenueId: number,
    catalogTags?: string[],
): OrderItemsBroadcastRow {
    const specs = draft.specifications;
    const spotType = String(specs.type ?? 'Generic');
    const cut = String(specs.cut ?? '');
    const durationWire = durationWireFromSpecValue(specs.duration_seconds);
    const encodingLabels = encodingLabelsFromWire(specs.encoding);
    const assetTracking = initialAssetTrackingFromCatalogTags(catalogTags);
    const missingAssetTags = missingAssetTagsFromTrackingMap(assetTracking);

    return {
        id: draft.pendingId,
        tour_venue_id: tourVenueId,
        type: 'broadcast',
        created_date: new Date().toISOString(),
        dueDate: formatShortUsDate(draft.due_date),
        spot_type: spotType,
        cut: cut as OrderItemsBroadcastRow['cut'],
        isci: 'Adding…',
        duration_seconds: durationWire,
        status_id: 1,
        language:
            typeof specs.language === 'string' ? specs.language : undefined,
        encoding: encodingLabels.length > 0 ? encodingLabels : undefined,
        encoding_label:
            encodingLabels.length > 0
                ? primaryEncodingLabel(encodingLabels)
                : undefined,
        asset_tracking: assetTracking,
        missingAssetTags,
        is_pending: true,
    };
}

export const broadcastCreateAdapter: OrderItemCreateAdapter<AddBroadcastStreamingFormValues> =
    {
        categoryId: ORDER_MENU_CATEGORY_QUADRANTS.broadcast,
        expandDrafts: expandBroadcastCreateDrafts,
        toStorePayload: (draft) => ({
            order_menu_item_id: draft.order_menu_item_id,
            due_date: draft.due_date,
            specifications: draft.specifications,
        }),
    };
