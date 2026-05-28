<?php

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Testing\AssertableInertia as Assert;

function ordersIndexUrl(): string
{
    return rtrim((string) config('services.api.base_url'), '/').'/api/orders';
}

it('proxies orders index to gtc-api and renders hybrid inertia props', function () {
    Http::fake([
        ordersIndexUrl() => Http::response([
            'orders' => [
                [
                    'id' => 1,
                    'tour_id' => 12,
                    'venue_id' => 84,
                    'ordered_by_id' => 4,
                    'is_demo' => false,
                    'due_date' => '2026-10-15',
                    'created_at' => '2026-05-27T20:00:00.000000Z',
                    'status' => 'New Order',
                    'awaiting_assets' => ['Audio'],
                    'tour' => ['id' => 12, 'name' => 'Eras Tour 2026'],
                    'venue' => [
                        'id' => 84,
                        'name' => 'SoFi Stadium',
                        'city' => 'Inglewood',
                        'state' => 'CA',
                        'country_id' => 1,
                    ],
                    'client' => [
                        'id' => 4,
                        'name' => 'Live Nation HQ',
                        'email' => 'hq@livenation.com',
                    ],
                    'order_items' => [
                        [
                            'id' => 142,
                            'assignees' => [
                                [
                                    'id' => 9,
                                    'name' => 'Alex Editor',
                                    'email' => 'alex@gtcforce.com',
                                ],
                            ],
                        ],
                    ],
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
            ->where('orders.0.status', 'new order')
            ->has('orders.0.collaborators', 1)
            ->has('grouped_orders', 1)
            ->where('grouped_orders.0.tour.id', 12)
            ->where('grouped_orders.0.orders.0.id', 1)
            ->has('order_status_options', 5)
            ->has('tours')
            ->has('venue_items')
            ->has('_legacy_orders')
        );

    Http::assertSent(function ($request) {
        return $request->url() === ordersIndexUrl()
            && $request->method() === 'GET'
            && $request->hasHeader('Authorization', 'Bearer test-bff-token');
    });
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
            ->has('venue_items')
        );

    Log::shouldHaveReceived('error')
        ->once()
        ->withArgs(fn (string $message, array $context) => $message === 'gtc-api orders index failed'
            && $context['status'] === 503);
});
