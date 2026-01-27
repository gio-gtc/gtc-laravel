import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    first_name?: string | null;
    last_name?: string | null;
    organization?: string | null;
    job_title?: string | null;
    department?: string | null;
    phone_number?: string | null;
    about_me?: string | null;
    out_of_office?: boolean;
    out_of_office_start_date?: string | null;
    out_of_office_end_date?: string | null;
    profile_photo_path?: string | null;
    company_id: number;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Country {
    id: number;
    name: string;
    code: string;
}

export interface Company {
    id: number;
    name: string;
    billing_address: string;
    city: string;
    zip: string;
    state: string;
    country_id: number;
    discount_rate: number;
    credit_limit: number;
    pay_email: string;
    rec_email: string;
    telephone: string;
    copy_email: string;
    fax_number: string;
    bank_account_number: string;
    routing_number: string;
    rec_name: string;
    rec_tel: string;
    country?: Country;
}

export interface Invoice {
    id: number;
    invoiceNumber: string;
    date: string;
    tour: string;
    market: string;
    venue: string;
    amount: number;
    showDate: string;
    isDeleted: boolean;
    user_id: number;
    company_id: number;
    held: number;
    release_date: string | null;
    payment_due?: string;
    clientReference: string;
    address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    country_id: number | null;
    delete_date: string | null;
    deleted_by: number | null;
    deleted_reason: string | null;
}

export interface Item {
    id: number;
    order_id: number;
    invoice_id: number;
    code: string;
    description: string;
    quantity: number;
    price: number;
}

export interface Tour {
    id: number;
    name: string;
    performer: string;
    owner_contact_id: number;
    date_started: string;
    live: 0 | 1;
    require_owner_approval: 0 | 1;
    special_instructions: string | null;
    gtc_rep_contact_id: number;
    high_def_only: 0 | 1;
    due_date: string;
}

export interface TourVenue {
    id: number;
    tour_id: number;
    venue_id: number;
    start_date: string;
    end_date: string;
    client: number;
    status: 'completed' | 'in-progress' | 'pending' | 'paused' | 'edit';
}

export interface Order {
    id: number;
    tour_venue_id: number;
    date: string;
    hold_invoices: 0 | 1;
    demo: 0 | 1;
    hash: string;
}

export interface Venue {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    country_id: number;
}

export interface VenueCollaborator {
    id: number;
    venue_id: number;
    mockUser_id: number;
}

export interface MediaTableRow {
    id: string | number;
    isci: string;
    cutName: string;
    duration: string; // e.g., ":45"
    dueDate: string; // e.g., "1/15/25"
    assigned: User | null;
    status:
        | 'Still in Cart'
        | 'Client Review'
        | 'In Production'
        | 'Out for Delivery'
        | 'Cancelled'
        | 'Revision Requested'
        | 'Unassigned';
    previewIcons: React.ReactNode[]; // Array of icon components
    deliverables?: {
        onReject?: () => void;
        onApprove?: () => void;
    };
}

export interface MediaTableProps {
    title: string; // Dynamic title (e.g., "Broadcast & Streaming Video")
    data: MediaTableRow[];
    defaultOpen?: boolean; // Default: true
    onAdd?: () => void; // Optional callback for add button
}
