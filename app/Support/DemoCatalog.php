<?php

namespace App\Support;

/**
 * Central access to config/mockdata.php slices for Inertia props.
 */
final class DemoCatalog
{
    /**
     * @return array<string, mixed>
     */
    public static function forDashboard(): array
    {
        return [
            'sales_chart' => config('mockdata.sales_chart', []),
            'ytd_chart' => config('mockdata.ytd_chart', []),
            'yoy_chart' => config('mockdata.yoy_chart', []),
            'tour_revenue' => config('mockdata.tour_revenue', []),
            'sales_by_rep' => config('mockdata.sales_by_rep', []),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function forOrders(): array
    {
        return [
            'tours' => config('mockdata.tours', []),
            'tour_venue_status' => config('mockdata.tour_venue_status', []),
            'tour_venue_stops' => config('mockdata.tour_venue_stops', []),
            'tour_demo_venues' => config('mockdata.tour_demo_venues', []),
            'tour_venues' => config('mockdata.tour_venues', []),
            'venues' => config('mockdata.venues', []),
            'orders' => config('mockdata.orders', []),
            'venue_items' => config('mockdata.venue_items', []),
            'venue_item_assigned' => config('mockdata.venue_item_assigned', []),
            'venue_item_status' => config('mockdata.venue_item_status', []),
            'invoices' => config('mockdata.invoices', []),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function forInvoices(): array
    {
        return [
            'invoices' => config('mockdata.invoices', []),
            'companies' => config('mockdata.companies', []),
            'countries' => config('mockdata.countries', []),
            'venues' => config('mockdata.venues', []),
            'invoice_items' => config('mockdata.invoice_items', []),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public static function users(): array
    {
        return config('mockdata.users', []);
    }
}
