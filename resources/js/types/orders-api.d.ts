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
    email: string;
    name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    avatar?: string | null;
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

/** Organisation nested on GET /api/clients search rows. */
export interface ClientSearchOrganisation {
    id: number;
    name: string;
}

/** Client user row from GET /api/clients (via BFF /api/search/clients). */
export interface ClientSearchOption {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    organisation_id: number;
    organisation: ClientSearchOrganisation;
}

/** BFF JSON shape for client autocomplete. */
export interface ClientsSearchResponse {
    clients?: ClientSearchOption[];
}

export interface ApiOrderTour {
    id: number;
    name: string;
}

export interface ApiOrderClient {
    id: number;
    email: string;
    /** Legacy/summary label when API denormalizes a display name. */
    name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    avatar?: string | null;
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

/** BFF form fields for POST /orders (staff may include ordered_by_id). */
export type CreateOrderForm = {
    tour_id: number;
    venue_id: number;
    due_date: string;
    show_date: string;
    local_deliverable_email: string;
    ordered_by_id?: number;
};
