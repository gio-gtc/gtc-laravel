import type {
    ApiOrder,
    GroupedOrders,
    OrderStatusOption,
} from './orders-api';
import type {
    Country,
    Invoice,
    InvoiceItem,
    Organisation,
    SharedData,
    Tour,
    TourVenue,
    TourVenueStatusRow,
    User,
    Venue,
    VenueItemAssigned,
    VenueItemEncoding,
    VenueItemLanguage,
    VenueItemNote,
    VenueItemStatus,
    VenueItemsRow,
} from './index';

export type SharedProps = SharedData;

/** Shared Inertia flash props (see HandleInertiaRequests `flash` share). */
export type FlashPayload = {
    success?: string | null;
    error?: string | null;
    new_organisation?: { id: number; name: string } | null;
};

export interface Country {
    id: number;
    name: string;
    currency_code: string;
    created_at?: string;
    updated_at?: string;
}

export interface OrganisationType {
    id: number;
    name: string;
    created_at?: string;
    updated_at?: string;
}

export type SalesChartPoint = { name: string; value: number };

export type TourRevenueRow = {
    tour: string;
    currentMonth: number;
    ytd: number;
    total: number;
};

export type SalesByRepRow = {
    rep: string;
    currentMonth: number;
    currentMonthChange: { direction: string; percentage: number };
    ytd: number;
    ytdChange: { direction: string; percentage: number };
    total: number;
};

export interface DashboardPageProps {
    sales_chart: SalesChartPoint[];
    ytd_chart: SalesChartPoint[];
    yoy_chart: SalesChartPoint[];
    tour_revenue: TourRevenueRow[];
    sales_by_rep: SalesByRepRow[];
}

export interface OrdersPageProps {
    orders: ApiOrder[];
    grouped_orders: GroupedOrders[];
    order_status_options: OrderStatusOption[];
}

/**
 * Legacy mock slices for order slideout (follow-up PR).
 * Not provided on GET /orders index; optional so list page stays slim.
 */
export interface OrdersSlideoutCatalogExtensions {
    tours?: Tour[];
    tour_venue_status?: TourVenueStatusRow[];
    tour_venue_stops?: TourVenue[];
    tour_venue_demos?: TourVenue[];
    venues?: Venue[];
    _legacy_orders?: import('./index').Order[];
    venue_items?: VenueItemsRow[];
    venue_item_assigned?: VenueItemAssigned[];
    venue_item_notes?: VenueItemNote[];
    venue_item_status?: VenueItemStatus[];
    venue_item_language?: VenueItemLanguage[];
    venue_item_encoding?: VenueItemEncoding[];
    invoices?: Invoice[];
    replaceVenueItem?: (row: VenueItemsRow) => void;
}

export type OrdersCatalogValue = OrdersPageProps &
    OrdersSlideoutCatalogExtensions;

export interface InvoicesPageProps {
    invoices: Invoice[];
    organisations: Organisation[];
    countries: Country[];
    venues: Venue[];
    invoice_items: InvoiceItem[];
}

export type DemoUser = User;

/** User row for tour modal rep / voice-over dropdowns (gtc-api). */
export type TourFormUser = {
    id: number;
    first_name?: string | null;
    last_name?: string | null;
    organisation_id?: number;
    organisation?: {
        organisation_type?: {
            id?: number;
        };
    };
    [key: string]: unknown;
};

export type TourFormDepartment = {
    id: number;
    name?: string;
    [key: string]: unknown;
};

/** Lazy shared props from HandleInertiaRequests (create-tour modal). */
export type TourFormPageProps = {
    departments?: TourFormDepartment[];
    gtcReps?: TourFormUser[];
    voiceOvers?: TourFormUser[];
};
