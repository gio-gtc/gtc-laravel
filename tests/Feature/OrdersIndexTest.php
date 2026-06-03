<?php

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Testing\AssertableInertia as Assert;

function ordersIndexUrl(): string
{
    return rtrim((string) config('services.api.base_url'), '/').'/api/orders';
}

function sampleApiOrderPayload(): array
{
    return [
        'id' => 1,
        'uuid' => '550e8400-e29b-41d4-a716-446655440000',
        'tour_id' => 12,
        'venue_id' => 84,
        'ordered_by_id' => 4,
        'is_demo' => false,
        'due_date' => '2026-10-15',
        'created_at' => '2026-05-27T20:00:00.000000Z',
        'updated_at' => '2026-05-27T20:00:00.000000Z',
        'submitted_at' => '2026-05-27T20:00:00.000000Z',
        'local_deliverable_email' => 'client@example.com',
        'status' => 'New Order',
        'item_statuses' => ['New Order'],
        'is_awaiting_assets' => false,
        'tour' => ['id' => 12, 'name' => 'Eras Tour 2026'],
        'venue' => [
            'id' => 84,
            'name' => 'SoFi Stadium',
            'city' => 'Inglewood',
            'state' => 'CA',
            'country_code' => 'US',
        ],
        'client' => [
            'id' => 4,
            'first_name' => 'Live',
            'last_name' => 'Nation',
            'email' => 'hq@livenation.com',
            'organisation_id' => 3,
            'organisation' => [
                'id' => 3,
                'name' => 'Live Nation HQ',
            ],
        ],
        'order_items' => [
            [
                'id' => 142,
                'order_id' => 1,
                'order_menu_item_id' => 4,
                'order_item_status_id' => 1,
                'locked_price' => '150.00',
                'status' => 'Still In Cart',
                'due_date' => '2026-10-15',
                'created_at' => '2026-05-27T20:00:00.000000Z',
                'updated_at' => '2026-05-27T20:00:00.000000Z',
                'specifications' => [
                    'isci' => 'GTC000142',
                    'awaiting_assets' => ['Audio'],
                ],
                'root_order_item_id' => null,
                'revision_number' => 1,
                'supersedes_order_item_id' => null,
                'invoice_line_id' => null,
                'order_menu_item' => [
                    'id' => 4,
                    'name' => '15s Social Teaser',
                    'order_menu_category_id' => 2,
                ],
                'assignees' => [
                    [
                        'id' => 9,
                        'name' => 'Alex Editor',
                        'email' => 'alex@gtcforce.com',
                        'first_name' => 'Alex',
                        'last_name' => 'Editor',
                    ],
                ],
            ],
        ],
    ];
}

it('proxies orders index to gtc-api and renders list inertia props', function () {
    Http::fake([
        ordersIndexUrl() => Http::response([
            'data' => [
                'orders' => [
                    sampleApiOrderPayload(),
                ],
            ],
        ], 200),
    ]);

    $this->actingAsBff()
        ->get(route('orders'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('orders')
            ->has('orders', 1)
            ->where('orders.0.id', 1)
            ->where('orders.0.uuid', '550e8400-e29b-41d4-a716-446655440000')
            ->where('orders.0.status', 'New Order')
            ->where('orders.0.is_awaiting_assets', false)
            ->where('orders.0.order_items.0.order_item_status_id', 1)
            ->where('orders.0.order_items.0.locked_price', '150.00')
            ->has('orders.0.collaborators', 1)
            ->has('grouped_orders', 1)
            ->where('grouped_orders.0.tour.id', 12)
            ->where('grouped_orders.0.orders.0.id', 1)
            ->has('order_status_options', 5)
            ->where('order_status_options.0.value', 'New Order')
            ->where('order_status_options.4.value', 'Canceled')
            ->has('venue_item_status')
            ->has('venue_item_language')
            ->has('venue_item_encoding')
            ->missing('tours')
            ->missing('_legacy_orders')
        );

    Http::assertSent(function ($request) {
        return $request->url() === ordersIndexUrl()
            && $request->method() === 'GET'
            && $request->hasHeader('Authorization', 'Bearer test-bff-token');
    });
});

it('unwraps legacy top-level orders key when data envelope is absent', function () {
    $order = sampleApiOrderPayload();
    $order['id'] = 2;
    $order['tour_id'] = 3;
    $order['venue_id'] = null;
    $order['is_demo'] = true;
    $order['due_date'] = '2026-11-01';
    $order['venue'] = null;
    $order['client'] = null;
    $order['order_items'] = [];

    Http::fake([
        ordersIndexUrl() => Http::response([
            'orders' => [$order],
        ], 200),
    ]);

    $this->actingAsBff()
        ->get(route('orders'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('orders', 1)
            ->where('orders.0.id', 2)
        );
});

it('redirects guests to login when visiting orders', function () {
    $this->get(route('orders'))
        ->assertRedirect(route('login'));

    Http::assertNothingSent();
});

it('returns empty orders and flashes error when gtc-api fails', function () {
    Log::spy();

    Http::fake([
        ordersIndexUrl() => Http::response([
            'message' => 'Orders are temporarily unavailable.',
        ], 503),
    ]);

    $this->actingAsBff()
        ->get(route('orders'))
        ->assertOk()
        ->assertSessionHas('error', 'Orders are temporarily unavailable.')
        ->assertInertia(fn (Assert $page) => $page
            ->component('orders')
            ->where('orders', [])
            ->where('grouped_orders', [])
            ->has('order_status_options', 5)
            ->has('venue_item_status')
        );

    Log::shouldHaveReceived('error')
        ->once()
        ->withArgs(fn (string $message, array $context) => $message === 'gtc-api request failed'
            && $context['status'] === 503);
});
