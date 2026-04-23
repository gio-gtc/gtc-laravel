import type {
    Company,
    Country,
    Invoice,
    InvoiceItem,
    Order,
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
    tours: Tour[];
    tour_venue_status: TourVenueStatusRow[];
    tour_venue_stops: TourVenue[];
    tour_venue_demos: TourVenue[];
    venues: Venue[];
    orders: Order[];
    venue_items: VenueItemsRow[];
    venue_item_assigned: VenueItemAssigned[];
    venue_item_notes: VenueItemNote[];
    venue_item_status: VenueItemStatus[];
    venue_item_language: VenueItemLanguage[];
    venue_item_encoding: VenueItemEncoding[];
    invoices: Invoice[];
}

/** Orders page catalog with client-side line updates (slideout edit modals). */
export interface OrdersCatalogValue extends OrdersPageProps {
    replaceVenueItem: (row: VenueItemsRow) => void;
}

export interface InvoicesPageProps {
    invoices: Invoice[];
    companies: Company[];
    countries: Country[];
    venues: Venue[];
    invoice_items: InvoiceItem[];
}

export type DemoUser = User;
