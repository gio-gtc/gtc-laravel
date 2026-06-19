import type { AddKeyArtStaticAssetsFormValues } from '@/components/pages/orders/slideout/switch-view/general-media/modals/add-key-art-static-assets-modal';
import { ORDER_MENU_CATEGORY_QUADRANTS } from '@/lib/orders/order-menu-categories';
import { artDimensionWire } from '@/lib/orders/order-item-specifications';
import { formatShortUsDate } from '@/lib/format/date';
import type { OrderItemsArtRow } from '@/types';
import type {
    ArtOrderItemUpdateAdapter,
    OrderItemCreateAdapter,
    OrderItemCreateDraft,
    OrderItemExpandContext,
} from './types';

function buildArtSpecifications(packageType: string): Record<string, unknown> {
    return { type: packageType };
}

function buildArtUpdateSpecifications(
    row: OrderItemsArtRow,
): Record<string, unknown> {
    return {
        type: row.package_type,
        w: artDimensionWire(row.width),
        h: artDimensionWire(row.height),
    };
}

export function expandArtCreateDrafts(
    form: AddKeyArtStaticAssetsFormValues,
    ctx: OrderItemExpandContext,
): OrderItemCreateDraft[] {
    const drafts: OrderItemCreateDraft[] = [];

    for (const packageType of form.types) {
        drafts.push({
            pendingId: ctx.nextPendingId(),
            order_menu_item_id: ctx.orderMenuItemId,
            due_date: ctx.dueDate,
            specifications: buildArtSpecifications(packageType),
        });
    }

    return drafts;
}

export function draftToPendingArtRow(
    draft: OrderItemCreateDraft,
    tourVenueId: number,
): OrderItemsArtRow {
    const specs = draft.specifications;
    const packageType = String(
        specs.type ?? 'Key Art Package',
    ) as OrderItemsArtRow['package_type'];

    return {
        id: draft.pendingId,
        tour_venue_id: tourVenueId,
        type: 'art',
        package_type: packageType,
        label: packageType,
        width: null,
        height: null,
        created_date: new Date().toISOString(),
        dueDate: formatShortUsDate(draft.due_date),
        status_id: 1,
        is_pending: true,
    };
}

export const artCreateAdapter: OrderItemCreateAdapter<AddKeyArtStaticAssetsFormValues> =
    {
        categoryId: ORDER_MENU_CATEGORY_QUADRANTS.keyArt,
        expandDrafts: expandArtCreateDrafts,
        toStorePayload: (draft) => ({
            order_menu_item_id: draft.order_menu_item_id,
            due_date: draft.due_date,
            specifications: draft.specifications,
        }),
    };

export const artUpdateAdapter: ArtOrderItemUpdateAdapter<OrderItemsArtRow> = {
    categoryId: ORDER_MENU_CATEGORY_QUADRANTS.keyArt,
    rowToFullBulkPatch: (row) => ({
        specifications: buildArtUpdateSpecifications(row),
    }),
    typePatch: (type) => ({
        specifications: { type: type.trim() },
    }),
    widthPatch: (width) => ({
        specifications: { w: artDimensionWire(width) },
    }),
    heightPatch: (height) => ({
        specifications: { h: artDimensionWire(height) },
    }),
    statusPatch: (statusId) => ({
        order_item_status_id: statusId,
    }),
};
