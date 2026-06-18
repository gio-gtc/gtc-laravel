import {
    createOrderItem,
    OrderItemApiError,
} from '@/lib/orders/order-item-api-client';
import { draftToPendingBroadcastRow } from '@/lib/orders/order-item-adapters/broadcast';
import { draftToPendingRadioRow } from '@/lib/orders/order-item-adapters/radio';
import { draftToPendingSocialRow } from '@/lib/orders/order-item-adapters/social';
import type {
    OrderItemCreateAdapter,
    OrderItemCreateDraft,
    SequentialCreateResult,
} from '@/lib/orders/order-item-adapters/types';
import { ORDER_MENU_CATEGORY_QUADRANTS } from '@/lib/orders/order-menu-categories';
import { upsertOrderItem } from '@/lib/orders/slideout/order-mutations';
import type { OrderItemsRow } from '@/types';
import type { ApiOrder } from '@/types/orders-api';

export type SequentialCreateDeps = {
    order: ApiOrder;
    setOpenOrder: React.Dispatch<React.SetStateAction<ApiOrder | null>>;
    setExtraVenueItems: React.Dispatch<React.SetStateAction<OrderItemsRow[]>>;
};

function pendingRowsForDrafts<TForm>(
    adapter: OrderItemCreateAdapter<TForm>,
    form: TForm,
    order: ApiOrder,
    orderMenuItemId: number,
    catalogTags?: string[],
): { drafts: ReturnType<OrderItemCreateAdapter<TForm>['expandDrafts']>; pendingRows: OrderItemsRow[] } {
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
    return draftToPendingBroadcastRow(draft, tourVenueId, catalogTags);
}

export async function runSequentialOrderItemCreate<TForm>(
    adapter: OrderItemCreateAdapter<TForm>,
    form: TForm,
    orderMenuItemId: number,
    deps: SequentialCreateDeps,
    catalogTags?: string[],
): Promise<SequentialCreateResult> {
    const { order, setOpenOrder, setExtraVenueItems } = deps;
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

        try {
            const result = await createOrderItem(
                order.id,
                adapter.toStorePayload(draft),
            );

            setOpenOrder((prev) =>
                prev ? upsertOrderItem(prev, result.order_item) : prev,
            );
            setExtraVenueItems((prev) =>
                prev.filter((row) => String(row.id) !== draft.pendingId),
            );
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
                return {
                    succeeded,
                    failed: true,
                    errors: error.errors,
                    stoppedAtIndex: index,
                };
            }

            return {
                succeeded,
                failed: true,
                stoppedAtIndex: index,
            };
        }
    }

    return { succeeded, failed: false };
}
