import Heading from '@/components/heading';
import OrdersTable from '@/components/pages/orders/orders-table';
import { OrdersCatalogProvider } from '@/contexts/orders-catalog-context';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
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
    };

    return (
        <OrdersCatalogProvider value={catalog}>
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
        </OrdersCatalogProvider>
    );
}
