import Heading from '@/components/heading';
import OrdersTable from '@/components/pages/orders/orders-table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Orders',
        href: '/orders',
    },
];

export default function Orders() {
    return (
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
    );
}
