export type OrderItemStatus =
    | 'new order'
    | 'in progress'
    | 'client review'
    | 'complete'
    | 'canceled';

export interface OrderStatusOption {
    value: OrderItemStatus;
    label: string;
}

export interface OrderCategory {
    id: number;
    name: string;
    required_tags?: string[] | null;
}

export interface OrderMenuItem {
    id: number;
    order_menu_category_id: number;
    name: string;
    default_price: string;
    category?: OrderCategory;
}

export interface OrderAssignee {
    id: number;
    name: string;
    email: string;
}

export interface OrderItem {
    id: number;
    order_id: number;
    order_menu_item_id: number;
    price_locked: string;
    status: OrderItemStatus;
    due_date: string;
    specifications: Record<string, unknown>;
    order_menu_item?: OrderMenuItem;
    assignees?: OrderAssignee[];
}

export interface ApiOrderVenue {
    id: number;
    name: string;
    city?: string | null;
    state?: string | null;
    country_id?: number | null;
}

export interface ApiOrderTour {
    id: number;
    name: string;
}

export interface ApiOrderClient {
    id: number;
    name: string;
    email: string;
}

/** Real order row from gtc-api GET /api/orders (normalized by BFF). */
export interface ApiOrder {
    id: number;
    tour_id: number;
    venue_id: number | null;
    ordered_by_id: number | null;
    is_demo: boolean;
    due_date: string;
    created_at: string;
    local_deliverable_email?: string | null;
    status: OrderItemStatus;
    awaiting_assets: string[];
    tour: ApiOrderTour;
    venue: ApiOrderVenue | null;
    client: ApiOrderClient | null;
    order_items: OrderItem[];
    collaborators?: OrderAssignee[];
}

export type GroupedOrders = {
    tour: ApiOrderTour;
    orders: ApiOrder[];
};
