import Heading from '@/components/heading';
import InvoicesTable from '@/components/pages/invoices/invoices-table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Invoices',
        href: '/invoices',
    },
];

export default function Invoices() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Invoices" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl">
                <Heading
                    title="Invoices"
                    description="Review invoices below."
                />
                <InvoicesTable />
            </div>
        </AppLayout>
    );
}
