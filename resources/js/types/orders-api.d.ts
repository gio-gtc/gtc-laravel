/**
 * Parent order status (virtual `orders.status` accessor) for list/table UI.
 * API may still emit `Still In Cart` when every line is in cart — map that on the
 * orders index table only; line-level `Still In Cart` stays in the slideout.
 */
export type OrderStatus =
    | 'New Order'
    | 'In Progress'
    | 'Client Review'
    | 'Complete'
    | 'Canceled';

/** Order container statuses shown in /orders filters and status icons. */
export type OrderStatusFilterValue = OrderStatus;

/** Cart-only waterfall value from gtc-api — not shown on /orders table. */
export type ApiOrderWireStatus = OrderStatus | 'Still In Cart';

export interface OrderStatusOption {
    value: OrderStatusFilterValue;
    label: string;
}

/** Line item pipeline status (virtual `order_items.status` accessor). */
export type OrderItemStatus =
    | 'Still In Cart'
    | 'Unassigned'
    | 'In Production'
    | 'Client Review'
    | 'Out For Delivery'
    | 'Canceled';

/** Asset blocker tags inside `order_items.specifications.awaiting_assets`. */
export type AwaitingAssetTag = 'Voice Over' | 'Audio' | 'Art';

/** UI quadrant ids from `order_menu_item.order_menu_category_id`. */
export type OrderMenuCategoryId = 1 | 2 | 3 | 4;

export interface OrderMenuItem {
    id: number;
    name: string;
    order_menu_category_id: OrderMenuCategoryId;
    default_price?: string;
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
    id: number;
    order_id: number;
    show_date: string;
}

export interface OrderItemSpecifications {
    isci?: string;
    awaiting_assets?: AwaitingAssetTag[];
    [key: string]: unknown;
}

export interface OrderItem {
    id: number;
    order_id: number;
    order_menu_item_id: number;
    /** Physical FK — use for future writes/state changes. */
    order_item_status_id: number;
    /** Virtual accessor — UI labels only. */
    status: OrderItemStatus;
    locked_price: string;
    due_date: string | null;
    specifications: OrderItemSpecifications;
    root_order_item_id: number | null;
    revision_number: number;
    supersedes_order_item_id: number | null;
    invoice_line_id: number | null;
    created_at: string;
    updated_at: string;
    order_menu_item?: OrderMenuItem;
    assignees?: OrderAssignee[];
}

export interface ApiOrderVenue {
    id: number;
    name: string;
    city: string;
    state: string;
    country_code: string;
}

/** Slim venue row from GET /api/venues (via BFF /api/search/venues). */
export interface VenueSearchOption {
    id: number;
    name: string;
    city?: string | null;
    state?: string | null;
    country_id?: number | null;
    is_international?: boolean;
    country_code?: string;
}

export interface VenuesSearchResponse {
    venues?: VenueSearchOption[];
}

export interface ApiOrderClientOrganisation {
    id: number;
    name: string;
    credit_terms?: string;
}

export interface ApiOrderClient {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    organisation_id?: number;
    organisation?: ApiOrderClientOrganisation;
    name?: string | null;
    avatar?: string | null;
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

export interface ClientsSearchResponse {
    clients?: ClientSearchOption[];
}

export interface ApiOrderTour {
    id: number;
    name: string;
}

/**
 * Order row from gtc-api GET /api/orders | GET /api/orders/{id}.
 * BFF may add `collaborators`.
 */
export interface ApiOrder {
    id: number;
    uuid: string;
    tour_id: number;
    venue_id: number | null;
    ordered_by_id: number | null;
    is_demo: boolean;
    local_deliverable_email: string | null;
    submitted_at: string | null;
    due_date: string | null;
    created_at: string;
    updated_at: string;

    /** Virtual primary status (server waterfall). */
    status: ApiOrderWireStatus;
    /** Deduped active parent statuses on lines in this order. */
    item_statuses: string[];
    /** True when any line is Unassigned, In Production, or Client Review. */
    is_awaiting_assets: boolean;

    tour?: ApiOrderTour;
    venue?: ApiOrderVenue | null;
    client?: ApiOrderClient | null;
    show_dates?: OrderShowDate[];
    order_items?: OrderItem[];

    /** BFF-derived from item assignees — not from gtc-api root. */
    collaborators?: OrderAssignee[];
}

export type GroupedOrders = {
    tour: ApiOrderTour;
    orders: ApiOrder[];
};

/** Assignee embed on lean index order items. */
export interface DashboardAssignee {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    avatar: string | null;
}

export interface LeanOrderItem {
    id: number;
    order_id: number;
    order_item_status_id: number;
    status: string;
    assignees: DashboardAssignee[];
}

export interface IndexOrderClientOrganisation {
    id: number;
    name: string;
    country_code: string;
    is_international: boolean;
}

export interface IndexOrderClient {
    id: number;
    first_name: string;
    last_name: string;
    organisation?: IndexOrderClientOrganisation;
}

export interface IndexOrderVenue {
    id: number;
    name: string;
    city: string;
    state: string;
}

/**
 * Lean order row from GET /api/tours/{tourId}/orders.
 */
export interface IndexOrder {
    id: number;
    uuid: string;
    tour_id: number;
    venue_id: number | null;
    ordered_by_id: number | null;
    is_demo: boolean;
    submitted_at: string | null;
    due_date: string | null;
    created_at: string;
    updated_at: string;
    status: ApiOrderWireStatus;
    item_statuses: string[];
    is_awaiting_assets: boolean;
    is_international: boolean;
    venue?: IndexOrderVenue | null;
    show_dates?: OrderShowDate[];
    client?: IndexOrderClient | null;
    order_items: LeanOrderItem[];
}

export interface TourHeader {
    id: number;
    name: string;
}

export interface ToursPaginationMeta {
    current_page: number;
    last_page: number;
    total: number;
    next_page_url: string | null;
}

export interface PaginatedToursResponse extends ToursPaginationMeta {
    data: TourHeader[];
}

/** Server-side filter params for tour feed and tour-orders endpoints. */
export interface GlobalDashboardFilters {
    search?: string;
    client_ids?: number[];
    assignee_ids?: number[];
    statuses?: OrderStatusFilterValue[];
    asset_tags?: AwaitingAssetTag[];
    is_international?: boolean;
    filter?: 'my-tasks' | null;
}

/** BFF form fields for POST /orders (staff may include ordered_by_id). */
export type CreateOrderForm = {
    tour_id: number;
    venue_id: number;
    due_date: string;
    show_dates: string[];
    local_deliverable_email: string;
    ordered_by_id?: number;
};
