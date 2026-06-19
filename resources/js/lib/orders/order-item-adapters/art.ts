import type { AddKeyArtStaticAssetsFormValues } from '@/components/pages/orders/slideout/switch-view/general-media/modals/add-key-art-static-assets-modal';
import { ORDER_MENU_CATEGORY_QUADRANTS } from '@/lib/orders/order-menu-categories';
import { formatShortUsDate } from '@/lib/format/date';
import type { OrderItemsArtRow } from '@/types';
import type {
    OrderItemCreateAdapter,
    OrderItemCreateDraft,
    OrderItemExpandContext,
} from './types';

const ART_DIMENSIONS_BY_PACKAGE: Record<
    OrderItemsArtRow['package_type'],
    { label: string; width: number; height: number }
> = {
    'Key Art Package': {
        label: 'Key Art',
        width: 1400,
        height: 400,
    },
    'Socials & Web Banners': {
        label: 'Socials & Web Banners',
        width: 1400,
        height: 400,
    },
    'International Key art & Social Package': {
        label: 'International Key art & Social Package',
        width: 1400,
        height: 400,
    },
};

function buildArtSpecifications(packageType: string): Record<string, unknown> {
    const defaults =
        ART_DIMENSIONS_BY_PACKAGE[
            packageType as OrderItemsArtRow['package_type']
        ];
    return {
        type: packageType,
        dimensions: defaults
            ? `${defaults.width}x${defaults.height}`
            : packageType,
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
    const defaults =
        ART_DIMENSIONS_BY_PACKAGE[packageType] ??
        ART_DIMENSIONS_BY_PACKAGE['Key Art Package'];

    return {
        id: draft.pendingId,
        tour_venue_id: tourVenueId,
        type: 'art',
        package_type: packageType,
        label: defaults.label,
        width: defaults.width,
        height: defaults.height,
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
