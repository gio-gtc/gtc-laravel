import Heading from '@/components/heading';
import OrdersTable from '@/components/pages/orders/orders-table';
import { OrdersCatalogProvider } from '@/contexts/orders-catalog-context';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData, type VenueItemsRow } from '@/types';
import {
    type OrdersCatalogValue,
    type OrdersPageProps,
} from '@/types/inertia-pages';
import { Head, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Orders',
        href: '/orders',
    },
];

export default function Orders() {
    const { props } = usePage<SharedData & OrdersPageProps>();
    const [venueItems, setVenueItems] = useState<VenueItemsRow[]>(
        () => props.venue_items,
    );

    useEffect(() => {
        /* eslint-disable react-hooks/set-state-in-effect -- sync from Inertia props on navigation */
        setVenueItems(props.venue_items);
        /* eslint-enable react-hooks/set-state-in-effect */
    }, [props.venue_items]);

    const replaceVenueItem = useCallback((row: VenueItemsRow) => {
        setVenueItems((prev) =>
            prev.map((r) => (String(r.id) === String(row.id) ? row : r)),
        );
    }, []);

    const catalog = useMemo(
        (): OrdersCatalogValue => ({
            tours: props.tours,
            tour_venue_status: props.tour_venue_status,
            tour_venue_stops: props.tour_venue_stops,
            tour_venue_demos: props.tour_venue_demos,
            venues: props.venues,
            orders: props.orders,
            venue_items: venueItems,
            venue_item_assigned: props.venue_item_assigned,
            venue_item_status: props.venue_item_status,
            venue_item_language: props.venue_item_language,
            venue_item_encoding: props.venue_item_encoding,
            invoices: props.invoices,
            replaceVenueItem,
        }),
        [
            props.tours,
            props.tour_venue_status,
            props.tour_venue_stops,
            props.tour_venue_demos,
            props.venues,
            props.orders,
            venueItems,
            props.venue_item_assigned,
            props.venue_item_status,
            props.venue_item_language,
            props.venue_item_encoding,
            props.invoices,
            replaceVenueItem,
        ],
    );

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
