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
    avatar?: string;
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
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface SalesByRepDataSchema {
    rep: string;
    currentMonth: number;
    currentMonthChange: { direction: 'up' | 'down'; percentage: number };
    ytd: number;
    ytdChange: { direction: 'up' | 'down'; percentage: numeber };
    total: number;
}

export type OrderStatus =
    | 'pending'
    | 'approved'
    | 'in-progress'
    | 'paused'
    | 'completed'
    | 'needs-attention'
    | 'mic'
    | 'speaker';

export interface UserData {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    permissionLevel: 'admin' | 'designer' | 'client' | 'collaborator';
}

export interface PendingOrder {
    id: string;
    name: string;
    venue: string;
    dueDate: string | null;
    client: UserData;
    collaborators: UserData[];
    status: OrderStatus[];
    tourGroup: string; // artist/tour name
}

export interface PendingOrderGroup {
    tourGroup: string;
    orders: PendingOrder[];
    isExpanded?: boolean;
}

export interface Invoice {
    id: number;
    invoiceNumber: string;
    date: string;
    tour: string;
    market: string;
    venue: string;
    ref: string;
    amount: number;
    daysToShow: number;
    showDate: Date;
    isDeleted: boolean;
}

export interface InvoiceItem {
    id: number;
    invoice_id: number;
    code: string;
    description: string;
    quantity: number;
    price: number;
}
