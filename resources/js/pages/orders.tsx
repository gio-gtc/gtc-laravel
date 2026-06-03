import Heading from '@/components/heading';
import OrdersTable from '@/components/pages/orders/orders-table';
import { OrderSlideoutCatalogProvider } from '@/contexts/order-slideout-catalog-context';
import { OrdersCatalogProvider } from '@/contexts/orders-catalog-context';
import AppLayout from '@/layouts/app-layout';
import {
    type Invoice,
    type VenueItemAssigned,
    type VenueItemEncoding,
    type VenueItemLanguage,
    type VenueItemNote,
    type VenueItemStatus,
    type VenueItemsRow,
    type BreadcrumbItem,
    type SharedData,
} from '@/types';
import {
    type OrdersCatalogValue,
    type OrdersPageProps,
} from '@/types/inertia-pages';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Orders',
        href: '/orders',
    },
];

export default function Orders() {
    const { props } = usePage<SharedData & OrdersPageProps>();

    const catalog: OrdersCatalogValue = {
        orders: props.orders,
        grouped_orders: props.grouped_orders,
        order_status_options: props.order_status_options,
        venue_items: props.venue_items as VenueItemsRow[] | undefined,
        venue_item_status: props.venue_item_status as
            | VenueItemStatus[]
            | undefined,
        venue_item_language: props.venue_item_language as
            | VenueItemLanguage[]
            | undefined,
        venue_item_encoding: props.venue_item_encoding as
            | VenueItemEncoding[]
            | undefined,
        venue_item_assigned: props.venue_item_assigned as
            | VenueItemAssigned[]
            | undefined,
        venue_item_notes: props.venue_item_notes as VenueItemNote[] | undefined,
        invoices: props.invoices as Invoice[] | undefined,
    };

    return (
        <OrdersCatalogProvider value={catalog}>
            <OrderSlideoutCatalogProvider>
                <AppLayout breadcrumbs={breadcrumbs}>
                    <Head title="Orders" />
                    <div className="flex h-full flex-1 flex-col overflow-x-auto rounded-xl">
                        <Heading
                            title="Orders"
                            description="Manage your orders with ease — track progress and add new items."
                        />
                        <OrdersTable />
                    </div>
                </AppLayout>
            </OrderSlideoutCatalogProvider>
        </OrdersCatalogProvider>
    );
}
