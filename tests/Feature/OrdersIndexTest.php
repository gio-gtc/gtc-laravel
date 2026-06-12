<?php

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Testing\AssertableInertia as Assert;

function toursIndexUrl(): string
{
    return rtrim((string) config('services.api.base_url'), '/').'/api/tours';
}

function sampleToursPaginationPayload(): array
{
    return [
        'current_page' => 1,
        'data' => [
            ['id' => 12, 'name' => 'Eras Tour 2026'],
            ['id' => 13, 'name' => 'Summer Festival 2026'],
        ],
        'last_page' => 2,
        'total' => 30,
        'next_page_url' => toursIndexUrl().'?page=2',
    ];
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
        'statuses' => [
            ['id' => 1, 'name' => 'New Order'],
        ],
        'tags' => ['Art'],
        'is_awaiting_assets' => false,
        'is_international' => false,
        'ticket_outlets' => 'Ticketmaster',
        'on_same_date' => null,
        'cardholder_times' => 'Doors 6 PM',
        'logos' => 'Primary logo only',
        'special_instructions' => 'Mix to -14 LUFS',
        'show_dates' => [
            [
                'id' => 145,
                'order_id' => 1,
                'show_date' => '2026-10-15',
            ],
        ],
        'venue' => [
            'id' => 84,
            'name' => 'SoFi Stadium',
            'city' => 'Inglewood',
            'state' => 'CA',
        ],
        'client' => [
            'id' => 4,
            'first_name' => 'Live',
            'last_name' => 'Nation',
            'organisation' => [
                'id' => 3,
                'name' => 'Live Nation HQ',
                'country_code' => 'US',
                'is_international' => false,
            ],
        ],
        'order_items' => [
            [
                'id' => 142,
                'order_id' => 1,
                'order_menu_item_id' => 1,
                'order_item_status_id' => 1,
                'order_menu_item' => [
                    'id' => 1,
                    'name' => 'Broadcast & Streaming Video Details',
                    'order_menu_category_id' => 1,
                ],
                'specifiable_id' => 14,
                'specifiable_type' => 'App\\Models\\OrderItemBroadcastSpecification',
                'specifiable' => [
                    'id' => 14,
                    'type' => 'Generic',
                    'cut' => 'On Sale Now',
                    'duration_seconds' => 30,
                    'language' => 'English',
                    'encoding' => 'Station MP4 (Broadcast)',
                    'isci' => 'ISCI-ABCDEFGH',
                    'asset_tracking' => [
                        'Voice Over' => false,
                        'Audio' => null,
                    ],
                ],
                'status_lookup' => [
                    'id' => 1,
                    'name' => 'Still In Cart',
                    'order_status_id' => 1,
                ],
                'assignees' => [
                    [
                        'id' => 9,
                        'email' => 'alex@gtcforce.com',
                        'first_name' => 'Alex',
                        'last_name' => 'Editor',
                        'avatar' => null,
                    ],
                ],
            ],
        ],
    ];
}

it('proxies tours index to gtc-api and renders list inertia props', function () {
    Http::fake([
        toursIndexUrl().'*' => Http::response(sampleToursPaginationPayload(), 200),
    ]);

    $this->actingAsBff()
        ->get(route('orders'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('orders')
            ->has('tours', 2)
            ->where('tours.0.id', 12)
            ->where('tours.0.name', 'Eras Tour 2026')
            ->where('tours_pagination.current_page', 1)
            ->where('tours_pagination.last_page', 2)
            ->where('tours_pagination.total', 30)
            ->has('order_status_options', 5)
            ->where('order_status_options.0.value', 'New Order')
            ->where('order_status_options.4.value', 'Cancelled')
            ->has('venue_item_language')
            ->has('venue_item_encoding')
            ->missing('orders')
            ->missing('grouped_orders')
            ->missing('_legacy_orders')
        );

    Http::assertSent(function ($request) {
        return $request->url() === toursIndexUrl().'?page=1'
            && $request->method() === 'GET'
            && $request->hasHeader('Authorization', 'Bearer test-bff-token');
    });
});

it('forwards filter query params to gtc-api on orders page load', function () {
    Http::fake([
        toursIndexUrl().'*' => Http::response(sampleToursPaginationPayload(), 200),
    ]);

    $this->actingAsBff()
        ->get(route('orders').'?filter=my-tasks&statuses[]=In+Progress')
        ->assertOk();

    Http::assertSent(function ($request) {
        parse_str(parse_url($request->url(), PHP_URL_QUERY), $query);

        return str_starts_with($request->url(), toursIndexUrl())
            && ($query['filter'] ?? null) === 'my-tasks'
            && in_array('In Progress', (array) ($query['statuses'] ?? []), true);
    });
});

it('redirects guests to login when visiting orders', function () {
    $this->get(route('orders'))
        ->assertRedirect(route('login'));

    Http::assertNothingSent();
});

it('returns empty tours and flashes error when gtc-api fails', function () {
    Log::spy();

    Http::fake([
        toursIndexUrl().'*' => Http::response([
            'message' => 'Tours are temporarily unavailable.',
        ], 503),
    ]);

    $this->actingAsBff()
        ->get(route('orders'))
        ->assertOk()
        ->assertSessionHas('error', 'Tours are temporarily unavailable.')
        ->assertInertia(fn (Assert $page) => $page
            ->component('orders')
            ->where('tours', [])
            ->where('tours_pagination.total', 0)
            ->has('order_status_options', 5)
        );

    Log::shouldHaveReceived('error')
        ->once()
        ->withArgs(fn (string $message, array $context) => $message === 'gtc-api request failed'
            && $context['status'] === 503);
});

it('proxies GET /api/tours with filter query params', function () {
    Http::fake([
        toursIndexUrl().'*' => Http::response(sampleToursPaginationPayload(), 200),
    ]);

    $this->actingAsBff()
        ->getJson('/api/tours?page=1&filter=my-tasks&statuses[]=Client+Review&asset_tags[]=Audio')
        ->assertOk()
        ->assertJsonPath('current_page', 1)
        ->assertJsonCount(2, 'data');

    Http::assertSent(function ($request) {
        parse_str(parse_url($request->url(), PHP_URL_QUERY), $query);

        return str_starts_with($request->url(), toursIndexUrl())
            && ($query['filter'] ?? null) === 'my-tasks'
            && in_array('Client Review', (array) ($query['statuses'] ?? []), true)
            && in_array('Audio', (array) ($query['asset_tags'] ?? []), true);
    });
});

it('redirects guests from tour index proxy', function () {
    $this->getJson('/api/tours')
        ->assertRedirect(route('login'));
});

it('proxies GET /api/tours/{tour}/orders and normalizes orders', function () {
    $tourOrdersUrl = toursIndexUrl().'/12/orders';

    Http::fake([
        $tourOrdersUrl.'*' => Http::response([
            'data' => [sampleApiOrderPayload()],
        ], 200),
    ]);

    $this->actingAsBff()
        ->getJson('/api/tours/12/orders?filter=my-tasks')
        ->assertOk()
        ->assertJsonPath('data.0.id', 1)
        ->assertJsonPath('data.0.collaborators.0.id', 9);

    Http::assertSent(function ($request) use ($tourOrdersUrl) {
        return str_starts_with($request->url(), $tourOrdersUrl)
            && str_contains($request->url(), 'filter=my-tasks');
    });
});

it('proxies GET /api/orders/{id} and normalizes order show payload', function () {
    $orderShowUrl = rtrim((string) config('services.api.base_url'), '/').'/api/orders/1';

    Http::fake([
        $orderShowUrl => Http::response([
            'data' => [
                'order' => sampleApiOrderPayload(),
            ],
        ], 200),
    ]);

    $this->actingAsBff()
        ->getJson('/api/orders/1')
        ->assertOk()
        ->assertJsonPath('order.id', 1)
        ->assertJsonPath('order.collaborators.0.id', 9)
        ->assertJsonPath('order.ticket_outlets', 'Ticketmaster')
        ->assertJsonPath('order.special_instructions', 'Mix to -14 LUFS');
});

it('proxies PATCH /api/orders/{id} with descriptions and show_dates', function () {
    $orderPatchUrl = rtrim((string) config('services.api.base_url'), '/').'/api/orders/1';

    $patchBody = [
        'ticket_outlets' => 'AXS / Venue',
        'on_same_date' => 'Same night graphics',
        'cardholder_times' => 'Doors 6 PM',
        'logos' => 'Primary logo',
        'special_instructions' => 'Mix to -14 LUFS',
        'show_dates' => [
            ['id' => 145, 'show_date' => '2026-10-15'],
            ['show_date' => '2026-10-16'],
        ],
    ];

    Http::fake([
        $orderPatchUrl => Http::response([
            'data' => array_merge(sampleApiOrderPayload(), $patchBody),
        ], 200),
    ]);

    $this->actingAsBff()
        ->patchJson('/api/orders/1', $patchBody)
        ->assertOk()
        ->assertJsonPath('order.ticket_outlets', 'AXS / Venue')
        ->assertJsonPath('order.show_dates.0.show_date', '2026-10-15')
        ->assertJsonPath('order.show_dates.1.show_date', '2026-10-16');

    Http::assertSent(function ($request) use ($orderPatchUrl, $patchBody) {
        return $request->url() === $orderPatchUrl
            && $request->method() === 'PATCH'
            && $request['ticket_outlets'] === $patchBody['ticket_outlets']
            && count($request['show_dates']) === 2
            && $request['show_dates'][0]['id'] === 145
            && ! isset($request['show_dates'][1]['id']);
    });
});

it('rejects PATCH /api/orders/{id} without editable fields', function () {
    $this->actingAsBff()
        ->patchJson('/api/orders/1', [])
        ->assertStatus(422);
});

it('redirects guests from order show proxy', function () {
    $this->getJson('/api/orders/1')
        ->assertRedirect(route('login'));
});
