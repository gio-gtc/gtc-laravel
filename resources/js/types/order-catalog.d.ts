import type { OrderMenuCategoryId } from '@/types/orders-api';

export interface OrderMenuFormBlueprintTypeSlice {
    cuts: string[];
    durations: number[];
    languages: string[];
}

export interface OrderMenuFormBlueprint {
    encodings: string[];
    types: Record<string, OrderMenuFormBlueprintTypeSlice>;
}

export interface OrderCatalogMenuItem {
    id: number;
    name: string;
    order_menu_category_id: OrderMenuCategoryId;
    form_blueprint?: OrderMenuFormBlueprint | null;
    /** Drives `specifiable.asset_tracking` columns initialized on line-item create. */
    tags?: string[];
}

export interface OrderCatalogCategory {
    id: number;
    name: string;
    order_menu_category_id?: OrderMenuCategoryId;
    order_menu_items: OrderCatalogMenuItem[];
}

export type OrderCatalogMenu = OrderCatalogCategory[];
