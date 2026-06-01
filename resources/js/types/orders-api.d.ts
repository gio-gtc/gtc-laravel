/** Order container status (orders.status) — Title Case wire values. */
export type OrderStatus =
    | 'New Order'
    | 'In Progress'
    | 'Client Review'
    | 'Complete'
    | 'Canceled';

export interface OrderStatusOption {
    value: OrderStatus;
    label: string;
}

/** Order line item pipeline status (order_items.status) — Title Case wire values. */
export type OrderItemStatus =
    | 'Still In Cart'
    | 'Unassigned'
    | 'In Production'
    | 'Client Review'
    | 'Out For Delivery'
    | 'Canceled';

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

export interface OrderShowDate {
    show_date: string;
}

export interface OrderItem {
    id: number;
    order_id: number;
    order_menu_item_id: number;
    locked_price: string;
    status: OrderItemStatus;
    due_date: string | null;
    specifications: Record<string, unknown>;
    root_order_item_id?: number | null;
    revision_number?: number;
    supersedes_order_item_id?: number | null;
    invoice_line_id?: number | null;
    order_menu_item?: OrderMenuItem;
    assignees?: OrderAssignee[];
}

export interface ApiOrderVenue {
    id: number;
    name: string;
    city?: string | null;
    state?: string | null;
    country_id?: number | null;
    is_international?: boolean;
}

/** Slim venue row from GET /api/venues (via BFF /api/search/venues). */
export type VenueSearchOption = ApiOrderVenue;

export interface VenuesSearchResponse {
    venues?: VenueSearchOption[];
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

/** Order row from gtc-api GET /api/orders (BFF adds collaborators). */
export interface ApiOrder {
    id: number;
    tour_id: number;
    venue_id: number | null;
    ordered_by_id: number | null;
    is_demo: boolean;
    due_date: string;
    submitted_at?: string | null;
    created_at: string;
    local_deliverable_email?: string | null;
    status: OrderStatus;
    awaiting_assets: string[];
    show_dates?: OrderShowDate[];
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
