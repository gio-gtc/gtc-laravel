import {
    createOrderItem,
    OrderItemApiError,
} from '@/lib/orders/order-item-api-client';
import { draftToPendingArtRow } from '@/lib/orders/order-item-adapters/art';
import { draftToPendingBroadcastRow } from '@/lib/orders/order-item-adapters/broadcast';
import { draftToPendingRadioRow } from '@/lib/orders/order-item-adapters/radio';
import { draftToPendingSocialRow } from '@/lib/orders/order-item-adapters/social';
import type {
    OrderItemCreateAdapter,
    OrderItemCreateDraft,
    SequentialCreateResult,
} from '@/lib/orders/order-item-adapters/types';
import { ORDER_MENU_CATEGORY_QUADRANTS } from '@/lib/orders/order-menu-categories';
import { orderItemIsci } from '@/lib/orders/order-item-specifications';
import {
    apiOrderToLegacySlideout,
    mapApiOrderItemToVenueRow,
} from '@/lib/orders/slideout/api-order-slideout';
import { upsertOrderItem } from '@/lib/orders/slideout/order-mutations';
import type { OrderItemsRow } from '@/types';
import type { OrderCatalogMenuItem } from '@/types/order-catalog';
import type { ApiOrder, OrderItem, OrderMenuItem, ParentOrderUpdate } from '@/types/orders-api';
import type { Dispatch, SetStateAction } from 'react';

export type SequentialCreateDeps = {
    order: ApiOrder;
    setOpenOrder: Dispatch<SetStateAction<ApiOrder | null>>;
    setExtraVenueItems: Dispatch<SetStateAction<OrderItemsRow[]>>;
    applyParentOrderBadgeUpdate?: (
        patch: ParentOrderUpdate | undefined,
    ) => void;
    refreshOpenOrder?: (orderId: number) => Promise<ApiOrder | null>;
};

function pendingRowsForDrafts<TForm>(
    adapter: OrderItemCreateAdapter<TForm>,
    form: TForm,
    order: ApiOrder,
    orderMenuItemId: number,
    catalogTags?: string[],
): {
    drafts: ReturnType<OrderItemCreateAdapter<TForm>['expandDrafts']>;
    pendingRows: OrderItemsRow[];
} {
    let pendingCounter = 0;
    const dueDate =
        order.due_date?.split('T')[0] ?? new Date().toISOString().slice(0, 10);

    const drafts = adapter.expandDrafts(form, {
        orderMenuItemId,
        dueDate,
        catalogTags,
        nextPendingId: () => {
            pendingCounter += 1;
            return `pending-${Date.now()}-${pendingCounter}`;
        },
    });

    const pendingRows: OrderItemsRow[] = drafts.map((draft) =>
        draftToPendingRow(adapter, draft, order.id, catalogTags),
    );

    return { drafts, pendingRows };
}

function draftToPendingRow<TForm>(
    adapter: OrderItemCreateAdapter<TForm>,
    draft: OrderItemCreateDraft,
    tourVenueId: number,
    catalogTags?: string[],
): OrderItemsRow {
    if (adapter.categoryId === ORDER_MENU_CATEGORY_QUADRANTS.social) {
        return draftToPendingSocialRow(draft, tourVenueId);
    }
    if (adapter.categoryId === ORDER_MENU_CATEGORY_QUADRANTS.radio) {
        return draftToPendingRadioRow(draft, tourVenueId, catalogTags);
    }
    if (adapter.categoryId === ORDER_MENU_CATEGORY_QUADRANTS.keyArt) {
        return draftToPendingArtRow(draft, tourVenueId);
    }
    return draftToPendingBroadcastRow(draft, tourVenueId, catalogTags);
}

function enrichCreatedOrderItem(
    item: OrderItem,
    catalogMenuItem?: OrderCatalogMenuItem,
): OrderItem {
    if (!catalogMenuItem) {
        return item;
    }

    const orderMenuItem: OrderMenuItem =
        item.order_menu_item ??
        ({
            id: catalogMenuItem.id,
            name: catalogMenuItem.name,
            order_menu_category_id: catalogMenuItem.order_menu_category_id,
        } satisfies OrderMenuItem);

    return {
        ...item,
        order_menu_item: orderMenuItem,
    };
}

function resolvePendingAfterCreate(
    nextOrder: ApiOrder,
    pendingRow: OrderItemsRow,
    createdItem: OrderItem,
): OrderItemsRow {
    const mapped = mapApiOrderItemToVenueRow(nextOrder, createdItem);
    if (mapped) {
        return mapped;
    }

    return {
        ...pendingRow,
        id: String(createdItem.id),
        isci:
            orderItemIsci(createdItem) ||
            (pendingRow.isci === 'Adding…' ? '' : pendingRow.isci),
        is_pending: false,
    } as OrderItemsRow;
}

function syncExtraAfterCreate(
    prevExtra: OrderItemsRow[],
    pendingId: string,
    nextOrder: ApiOrder,
    pendingRow: OrderItemsRow,
    createdItem: OrderItem,
): OrderItemsRow[] {
    const apiRows =
        apiOrderToLegacySlideout(nextOrder).catalogExtensions.venue_items ?? [];
    const createdId = String(createdItem.id);
    const inApiList = apiRows.some((row) => String(row.id) === createdId);

    if (inApiList) {
        return prevExtra.filter((row) => String(row.id) !== pendingId);
    }

    const resolved = resolvePendingAfterCreate(
        nextOrder,
        pendingRow,
        createdItem,
    );
    return prevExtra.map((row) =>
        String(row.id) === pendingId ? resolved : row,
    );
}

export async function runSequentialOrderItemCreate<TForm>(
    adapter: OrderItemCreateAdapter<TForm>,
    form: TForm,
    orderMenuItemId: number,
    deps: SequentialCreateDeps,
    catalogTags?: string[],
    catalogMenuItem?: OrderCatalogMenuItem,
): Promise<SequentialCreateResult> {
    const { order, setOpenOrder, setExtraVenueItems, applyParentOrderBadgeUpdate, refreshOpenOrder } =
        deps;
    const { drafts, pendingRows } = pendingRowsForDrafts(
        adapter,
        form,
        order,
        orderMenuItemId,
        catalogTags,
    );

    if (drafts.length === 0) {
        return { succeeded: 0, failed: false };
    }

    setExtraVenueItems((prev) => [...prev, ...pendingRows]);

    let succeeded = 0;

    for (let index = 0; index < drafts.length; index += 1) {
        const draft = drafts[index]!;
        const pendingRow = pendingRows[index]!;

        try {
            const result = await createOrderItem(
                order.id,
                adapter.toStorePayload(draft),
            );

            applyParentOrderBadgeUpdate?.(result.parent_order_update);

            const createdItem = enrichCreatedOrderItem(
                result.order_item,
                catalogMenuItem,
            );

            let nextOrder: ApiOrder | undefined;
            setOpenOrder((prevOrder) => {
                if (!prevOrder) {
                    return prevOrder;
                }

                nextOrder = upsertOrderItem(prevOrder, createdItem);
                return nextOrder;
            });
            if (nextOrder) {
                setExtraVenueItems((prevExtra) =>
                    syncExtraAfterCreate(
                        prevExtra,
                        draft.pendingId,
                        nextOrder!,
                        pendingRow,
                        createdItem,
                    ),
                );
            }
            succeeded += 1;
        } catch (error) {
            setExtraVenueItems((prev) =>
                prev.map((row) =>
                    String(row.id) === draft.pendingId
                        ? { ...row, is_pending: false, create_error: 'Failed' }
                        : row,
                ),
            );

            if (error instanceof OrderItemApiError && error.status === 422) {
                void refreshOpenOrder?.(order.id);
                return {
                    succeeded,
                    failed: true,
                    errors: error.errors,
                    stoppedAtIndex: index,
                };
            }

            void refreshOpenOrder?.(order.id);
            return {
                succeeded,
                failed: true,
                stoppedAtIndex: index,
            };
        }
    }

    if (succeeded > 0) {
        void refreshOpenOrder?.(order.id);
    }

    return { succeeded, failed: false };
}
