import type { StoreOrderItemPayload } from '@/lib/orders/slideout/legacy-venue-row-to-api-item';
import type { OrderMenuCategoryId } from '@/types/orders-api';
import type { ApiOrder } from '@/types/orders-api';
import type { OrderItemsRow } from '@/types';

export type OrderItemBulkPatch = {
    due_date?: string;
    order_item_status_id?: number;
    assignee_ids?: number[];
    specifications?: Record<string, unknown>;
};

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
    /** Catalog menu item tags — used for optimistic asset_tracking on pending rows. */
    catalogTags?: string[];
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

export interface OrderItemUpdateAdapter<TVenueRow extends OrderItemsRow> {
    categoryId: OrderMenuCategoryId;
    rowToFullBulkPatch: (row: TVenueRow, order: ApiOrder) => OrderItemBulkPatch;
    durationPatch: (wire: number | string) => OrderItemBulkPatch;
    statusPatch: (statusId: number) => OrderItemBulkPatch;
}
