import type {
    AllAudioCuts,
    AllBroadcastCuts,
    AudioSpotType,
    BroadcastSpotType,
    SocialCutOption,
    SocialVideoLayoutType,
    VenueItemArtPackageType,
    VenueItemSocialCardHolder,
} from '@/components/pages/orders/slideout/switch-view/general-media/modals/spot-type-cuts-options';
import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';
import type { KeyboardEvent } from 'react';

export interface VenueTableCellEditing {
    onCellChange: (
        itemId: number | string,
        field: string,
        value: string | number,
    ) => void;
    onCellDoubleClick: (
        itemId: number | string,
        field: string,
        scope?: string,
    ) => void;
    onCellBlur: () => void;
    onCellKeyDown: (
        e: KeyboardEvent<HTMLElement>,
        itemId: number | string,
        field: string,
        scope?: string,
    ) => void;
    isCellEditing: (
        itemId: number | string,
        field: string,
        scope?: string,
    ) => boolean;
}

export interface Auth {
    user: User;
    roles: string[];
    permissions: string[];
    token: string | null;
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
    /** When set, item is active only when URL has matching filter param (e.g. filter=my-tasks) */
    filterParam?: string;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    users?: User[];
    /** Demo catalog users from config (merged with DB users in useUsersWithFallback). */
    demoUsers?: User[];
    /** Cached reference dropdown data + selectable role names (gtc-api, BFF). */
    ApiReferenceData: {
        org_types: OrganisationType[];
        countries: Country[];
        currency_codes: string[];
        roles: string[];
    };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    email_verified_at: string | null;
    pending_email?: string | null;
    two_factor_enabled?: boolean;
    first_name?: string | null;
    last_name?: string | null;
    job_title?: string | null;
    department?: string | null;
    phone_number?: string | null;
    about_me?: string | null;
    out_of_office?: boolean;
    out_of_office_start_date?: string | null;
    out_of_office_end_date?: string | null;
    role: string;
    roles?: string[] | null;
    profile_photo_path?: string | null;
    organisation_id: number;
    organisation_name?: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Country {
    id: number;
    name: string;
    code: string;
}

export interface Organisation {
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
    venue_id: number;
    amount: number;
    showDate: string;
    isDeleted: boolean;
    user_id: number;
    organisation_id: number;
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

export interface InvoiceItem {
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
    created_at: string;
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
    venue_id: number | null;
    /** When set, `/demo/{demo_uuid}` loads assets for this tour–venue from venue_items. */
    demo_uuid?: string | null;
    start_date: string;
    end_date: string;
    client: number;
    created_at: string;
    status: number[] | null;
}

/** Row shape for tour venue status options (id for logic, label for display). */
export interface TourVenueStatusRow {
    id: number;
    label:
        | 'New Order'
        | 'In Progress'
        | 'Voice Over'
        | 'Audio'
        | 'Art'
        | 'Paused'
        | 'Completed';
}

export type TourVenueStatusValue = Exclude<TourVenue['status'], null>[number];

export interface Order {
    id: number;
    tour_venue_id: number;
    date: string;
    hold_invoices: 0 | 1;
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

export interface VenueItemAssigned {
    id: number;
    venue_item_id: string;
    mockUser_id: number;
}

export interface VenueItemStatus {
    id: number;
    type:
        | 'Still in Cart'
        | 'Client Review'
        | 'In Production'
        | 'Out for Delivery'
        | 'Cancelled'
        | 'Revision Requested'
        | 'Unassigned';
}

export interface VenueItemLanguage {
    id: number;
    type: string;
}

export interface VenueItemEncoding {
    id: number;
    type: string;
}

export interface MediaTableRow {
    id: string | number;
    isci: string;
    cutName: string;
    duration_seconds: number;
    dueDate: string;
    assigned: User[];
    status: VenueItemStatus['type'];
    /** Optional video URL for the preview modal. When absent, a default placeholder video is used. */
    previewVideoUrl?: string | null;
    /** When set, preview opens a full-image dialog instead of video (e.g. social image cutdown). */
    previewImageUrl?: string | null;
    deliverables?: {
        onReject?: () => void;
        onApprove?: () => void;
        onDownload?: (optionId: string) => void;
    };
    /** ISO 8601 UTC — used for General Media sort by created date */
    created_date: string;
}

export interface MediaTableProps {
    title: string; // Dynamic title (e.g., "Broadcast & Streaming Video")
    data: MediaTableRow[];
    defaultOpen?: boolean; // Default: true
    onAdd?: () => void; // Optional callback for add button
    /** Preview column: video (play + link) vs audio (waveform). */
    previewKind?: 'video' | 'audio';
    /** Called when user chooses "Upload" from the ISCI column dropdown */
    onUploadRow?: (row: MediaTableRow) => void;
    /** Called when user chooses "Edit ISCI" from the ISCI column dropdown */
    onEditIsciRow?: (row: MediaTableRow) => void;
    /** Opens add modal prefilled for line edit (e.g. duration) when provided */
    onEditLineInModal?: (row: MediaTableRow) => void;
    /** Called when a preview icon is clicked (row, iconIndex). Video: 0 = play, 1 = link; audio: 0 only. */
    onPreviewClick?: (row: MediaTableRow, iconIndex: number) => void;
    /** When set, Cut Name uses EditableCellInput (parent should own useEditableTable) */
    cellEditing?: VenueTableCellEditing;
    /** Unique when the same `data` rows are shown in multiple MediaTables (general media: broadcast / social / audio). */
    editScope?: string;
    selectedRowIds?: ReadonlySet<string | number>;
    onRowSelectToggle?: (rowId: string | number) => void;
    onBulkEditDueDateDoubleClick?: (rowId: string | number) => void;
    onBulkEditAssignedDoubleClick?: (rowId: string | number) => void;
    venueItemStatusSelectOptions: { value: string; label: string }[];
}

export interface StaticAssetsTableRow {
    id: string | number;
    cutName: string;
    width: number;
    height: number;
    dueDate: string; // e.g., "1/15/25"
    assigned: User[];
    status: VenueItemStatus['type'];
    /** Full-size image URL for key-art preview when present. */
    previewImageUrl?: string | null;
    deliverables?: {
        onReject?: () => void;
        onApprove?: () => void;
        onDownload?: (optionId: string) => void;
    };
    /** ISO 8601 UTC — used for General Media sort by created date */
    created_date: string;
}

export interface StaticAssetsMediaTableProps {
    title: string;
    data: StaticAssetsTableRow[];
    defaultOpen?: boolean;
    onAdd?: () => void;
    /** When set, Cut Name / W / H use EditableCellInput */
    cellEditing?: VenueTableCellEditing;
    /** Opens full-size image preview for rows with `previewImageUrl`. */
    onPreviewImageClick?: (row: StaticAssetsTableRow) => void;
    selectedRowIds?: ReadonlySet<string | number>;
    onRowSelectToggle?: (rowId: string | number) => void;
    onBulkEditDueDateDoubleClick?: (rowId: string | number) => void;
    onBulkEditAssignedDoubleClick?: (rowId: string | number) => void;
    venueItemStatusSelectOptions: { value: string; label: string }[];
    artPackageTypeSelectOptions?: { value: string; label: string }[];
}

export interface VenueItemNote {
    id: number;
    venue_item_id: string;
    user_id: number;
    message: string;
    /** ISO 8601 UTC */
    created_date: string;
    /** ISO 8601 UTC, nullable */
    updated_date: string | null;
    /** ISO 8601 UTC, nullable — soft delete */
    deleted_date: string | null;
}

export type VenueItemsRowType =
    | 'broadcast'
    | 'radio'
    | 'social'
    | 'art'
    | 'localized';

export interface VenueItemsRowBase {
    id: string;
    tour_venue_id: number;
    type: VenueItemsRowType;
    dueDate: string;
    /** ISO 8601 UTC — line creation time (mock + API) */
    created_date: string;
}

/** Line items for broadcast, radio, or social (video/audio spots). */
export type VenueItemMediaKind = 'video' | 'audio' | 'image';

/** Shared fields for broadcast / radio / social venue line items. */
export interface VenueItemsMediaLineShared {
    isci: string;
    duration_seconds: number;
    status_id: number;
    /** Present on broadcast, social, and radio mock rows when supplied. */
    language_id?: number;
    /** Present on broadcast mock rows only when supplied. */
    encoding_id?: number;
    /** Free-form encoding when not using `encoding_id` (broadcast). */
    encoding_custom?: string;
    previewVideoUrl?: string | null;
    thumbnailUrl?: string;
    mediaUrl?: string;
    kind?: VenueItemMediaKind;
    deliverables?: MediaTableRow['deliverables'];
    /** Set from server JSON when row supports deliverable actions (replaces inline mock callbacks). */
    has_deliverable_actions?: boolean;
    order_id?: number;
}

/** Broadcast: spot types and cuts match add Broadcast & Streaming modal. */
export interface VenueItemsBroadcastRow
    extends VenueItemsRowBase,
        VenueItemsMediaLineShared {
    type: 'broadcast';
    spot_type: BroadcastSpotType;
    cut: AllBroadcastCuts;
}

/** Radio (audio): spot types and cuts match add Audio modal. */
export interface VenueItemsRadioRow
    extends VenueItemsRowBase,
        VenueItemsMediaLineShared {
    type: 'radio';
    spot_type: AudioSpotType;
    cut: AllAudioCuts;
}

/** Social: layout type and cut match add Social Video modal. */
export interface VenueItemsSocialRow
    extends VenueItemsRowBase,
        VenueItemsMediaLineShared {
    type: 'social';
    spot_type: SocialVideoLayoutType;
    cut: SocialCutOption;
    /** When set, matches add-modal card holder selection (reporting / search). */
    card_holder?: VenueItemSocialCardHolder;
}

export type VenueItemsBroadcastRadioSocialRow =
    | VenueItemsBroadcastRow
    | VenueItemsRadioRow
    | VenueItemsSocialRow;

/** Key art and static assets (General Media). */
export interface VenueItemsArtRow extends VenueItemsRowBase {
    type: 'art';
    /** Billable line from Add Key Art & Static Assets (one row per selected type). */
    package_type: VenueItemArtPackageType;
    label: string;
    width: number;
    height: number;
    status_id: number;
    thumbnailUrl?: string;
    mediaUrl?: string;
    kind?: 'image';
    deliverables?: StaticAssetsTableRow['deliverables'];
    has_deliverable_actions?: boolean;
    order_id?: number;
}

export interface VenueItemsLocalizedRow extends VenueItemsRowBase {
    type: 'localized';
    label: string;
    width: number;
    height: number;
    cta: string;
}

export type VenueItemsRow =
    | VenueItemsBroadcastRadioSocialRow
    | VenueItemsArtRow
    | VenueItemsLocalizedRow;

export interface LocalizedArtTableRow {
    id: string | number;
    description: string;
    width: number;
    height: number;
    cta: string;
    dueDate: string;
    assigned: User[];
}

export interface LocalizedArtTableProps {
    title: string;
    data: LocalizedArtTableRow[];
    defaultOpen?: boolean;
    onAdd?: () => void;
    onOpenNotes?: (row: LocalizedArtTableRow) => void;
    /** When set, Description / W / H / CTA use EditableCellInput */
    cellEditing?: VenueTableCellEditing;
    selectedRowIds?: ReadonlySet<string | number>;
    onRowSelectToggle?: (rowId: string | number) => void;
    onBulkEditDueDateDoubleClick?: (rowId: string | number) => void;
    onBulkEditAssignedDoubleClick?: (rowId: string | number) => void;
}
