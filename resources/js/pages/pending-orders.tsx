import Heading from '@/components/heading';
import PendingOrdersTable from '@/components/pages/pending-orders/pending-orders-table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pending Orders',
        href: '/pending-orders',
    },
];

export default function PendingOrders() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pending Orders" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl">
                <Heading
                    title="Pending Orders"
                    description="Manage and track your pending orders"
                />
                <PendingOrdersTable />
            </div>
        </AppLayout>
    );
}
