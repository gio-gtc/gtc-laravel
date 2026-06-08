import type { AddBroadcastStreamingFormValues } from '@/components/pages/orders/slideout/switch-view/general-media/modals/add-broadcast-streaming-modal';
import { ORDER_MENU_CATEGORY_QUADRANTS } from '@/lib/orders/order-menu-categories';
import { pillToBlueprintDuration } from '@/lib/orders/order-catalog';
import type { OrderItemsBroadcastRow } from '@/types';
import { formatShortUsDate } from '@/lib/format/date';
import type {
    OrderItemCreateAdapter,
    OrderItemCreateDraft,
    OrderItemExpandContext,
} from './types';

function buildBroadcastSpecifications(
    form: AddBroadcastStreamingFormValues,
    enc: AddBroadcastStreamingFormValues['encodings'][number],
): Record<string, unknown> {
    const specs: Record<string, unknown> = {
        type: form.type,
        cut: enc.cut,
        duration_seconds: pillToBlueprintDuration(enc.duration),
        language: enc.language,
    };

    if (enc.encodingMode === 'custom') {
        const text = enc.encoding.trim();
        if (text) {
            specs.encoding_custom = text;
        }
    } else if (enc.encoding) {
        specs.encoding = enc.encoding;
    }

    return specs;
}

export function expandBroadcastCreateDrafts(
    form: AddBroadcastStreamingFormValues,
    ctx: OrderItemExpandContext,
): OrderItemCreateDraft[] {
    const drafts: OrderItemCreateDraft[] = [];

    for (const enc of form.encodings) {
        if (enc.encodingMode === 'custom' && !enc.encoding.trim()) {
            continue;
        }
        if (enc.encodingMode === 'catalog' && !enc.encoding) {
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
): OrderItemsBroadcastRow {
    const specs = draft.specifications;
    const spotType = String(specs.type ?? 'Generic');
    const cut = String(specs.cut ?? '');
    const durationSeconds =
        typeof specs.duration_seconds === 'number'
            ? specs.duration_seconds
            : Number(specs.duration_seconds) || 0;

    return {
        id: draft.pendingId,
        tour_venue_id: tourVenueId,
        type: 'broadcast',
        created_date: new Date().toISOString(),
        dueDate: formatShortUsDate(draft.due_date),
        spot_type: spotType as OrderItemsBroadcastRow['spot_type'],
        cut: cut as OrderItemsBroadcastRow['cut'],
        isci: 'Adding…',
        duration_seconds: durationSeconds,
        status_id: 1,
        language:
            typeof specs.language === 'string' ? specs.language : undefined,
        encoding:
            typeof specs.encoding === 'string' ? specs.encoding : undefined,
        encoding_custom:
            typeof specs.encoding_custom === 'string'
                ? specs.encoding_custom
                : undefined,
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
