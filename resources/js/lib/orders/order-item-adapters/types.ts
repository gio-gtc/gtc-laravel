import type { StoreOrderItemPayload } from '@/lib/orders/slideout/legacy-venue-row-to-api-item';
import type { OrderMenuCategoryId } from '@/types/orders-api';

export type OrderItemCreateDraft = {
    pendingId: string;
    order_menu_item_id: number;
    due_date: string;
    specifications: Record<string, unknown>;
};

export type OrderItemExpandContext = {
    orderMenuItemId: number;
    dueDate: string;
    nextPendingId: () => string;
};

export interface OrderItemCreateAdapter<TForm> {
    categoryId: OrderMenuCategoryId;
    expandDrafts: (
        form: TForm,
        ctx: OrderItemExpandContext,
    ) => OrderItemCreateDraft[];
    toStorePayload: (draft: OrderItemCreateDraft) => StoreOrderItemPayload;
}

export type SequentialCreateResult = {
    succeeded: number;
    failed: boolean;
    errors?: Record<string, string[]>;
    stoppedAtIndex?: number;
};
