<?php

use Illuminate\Support\Facades\Http;

function ordersStoreApiUrl(): string
{
    return rtrim((string) config('services.api.base_url'), '/').'/api/orders';
}

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function bffStaffSessionUser(array $overrides = []): array
{
    return array_merge([
        'id' => 10,
        'organisation' => ['id' => 1, 'name' => 'GTC'],
    ], $overrides);
}

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function bffClientSessionUser(array $overrides = []): array
{
    return array_merge([
        'id' => 42,
        'organisation' => ['id' => 5, 'name' => 'Client Org'],
    ], $overrides);
}

it('proxies staff create order to gtc-api with mapped payload', function () {
    Http::fake([
        ordersStoreApiUrl() => Http::response([
            'data' => ['id' => 99],
        ], 201),
    ]);

    $this->actingAsBff(bffStaffSessionUser())
        ->post(route('orders.store'), [
            'tour_id' => 12,
            'venue_id' => 84,
            'due_date' => '2026-10-20',
            'show_dates' => ['2026-10-15'],
            'local_deliverable_email' => 'client@example.com',
            'ordered_by_id' => 4,
        ])
        ->assertRedirect(route('orders'))
        ->assertSessionHas('success', 'Order created successfully.')
        ->assertSessionHas('created_order', ['id' => 99, 'tour_id' => 12]);

    Http::assertSent(function ($request) {
        if ($request->url() !== ordersStoreApiUrl() || $request->method() !== 'POST') {
            return false;
        }

        $body = $request->data();

        return $body['tour_id'] === 12
            && $body['venue_id'] === 84
            && $body['is_demo'] === false
            && $body['ordered_by_id'] === 4
            && $body['due_date'] === '2026-10-20'
            && $body['local_deliverable_email'] === 'client@example.com'
            && count($body['show_dates']) === 1
            && $body['show_dates'][0]['show_date'] === '2026-10-15'
            && $request->hasHeader('Authorization', 'Bearer test-bff-token');
    });
});

it('proxies multiple show dates and dedupes before sending to gtc-api', function () {
    Http::fake([
        ordersStoreApiUrl() => Http::response([
            'data' => ['id' => 101],
        ], 201),
    ]);

    $this->actingAsBff(bffStaffSessionUser())
        ->post(route('orders.store'), [
            'tour_id' => 12,
            'venue_id' => 84,
            'due_date' => '2026-10-20',
            'show_dates' => ['2026-10-17', '2026-10-15', '2026-10-16', '2026-10-15'],
            'ordered_by_id' => 4,
        ])
        ->assertRedirect(route('orders'));

    Http::assertSent(function ($request) {
        $body = $request->data();

        return count($body['show_dates']) === 3
            && $body['show_dates'][0]['show_date'] === '2026-10-15'
            && $body['show_dates'][1]['show_date'] === '2026-10-16'
            && $body['show_dates'][2]['show_date'] === '2026-10-17';
    });
});

it('sets ordered_by_id from session for client users', function () {
    Http::fake([
        ordersStoreApiUrl() => Http::response(['data' => ['id' => 100]], 201),
    ]);

    $this->actingAsBff(bffClientSessionUser())
        ->post(route('orders.store'), [
            'tour_id' => 3,
            'venue_id' => 10,
            'due_date' => '2026-11-01',
            'show_dates' => ['2026-11-01'],
            'local_deliverable_email' => '',
        ])
        ->assertRedirect(route('orders'));

    Http::assertSent(fn ($request) => $request->url() === ordersStoreApiUrl()
        && ($request->data()['ordered_by_id'] ?? null) === 42);
});

it('rejects ordered_by_id for client users', function () {
    Http::fake();

    $this->actingAsBff(bffClientSessionUser())
        ->post(route('orders.store'), [
            'tour_id' => 3,
            'venue_id' => 10,
            'due_date' => '2026-11-01',
            'show_dates' => ['2026-11-01'],
            'ordered_by_id' => 99,
        ])
        ->assertSessionHasErrors('ordered_by_id');

    Http::assertNothingSent();
});

it('requires ordered_by_id for staff', function () {
    Http::fake();

    $this->actingAsBff(bffStaffSessionUser(['id' => 10]))
        ->post(route('orders.store'), [
            'tour_id' => 1,
            'venue_id' => 2,
            'due_date' => '2026-06-01',
            'show_dates' => ['2026-06-01'],
        ])
        ->assertSessionHasErrors('ordered_by_id');

    Http::assertNothingSent();
});

it('requires at least one show date', function () {
    Http::fake();

    $this->actingAsBff(bffStaffSessionUser())
        ->post(route('orders.store'), [
            'tour_id' => 1,
            'venue_id' => 2,
            'due_date' => '2026-06-01',
            'show_dates' => [],
            'ordered_by_id' => 4,
        ])
        ->assertSessionHasErrors('show_dates');

    Http::assertNothingSent();
});

it('forwards api validation errors to the form', function () {
    Http::fake([
        ordersStoreApiUrl() => Http::response([
            'message' => 'Validation failed.',
            'errors' => [
                'venue_id' => ['The selected venue is invalid.'],
            ],
        ], 422),
    ]);

    $this->actingAsBff(bffStaffSessionUser())
        ->post(route('orders.store'), [
            'tour_id' => 1,
            'venue_id' => 999,
            'due_date' => '2026-06-01',
            'show_dates' => ['2026-06-01'],
            'ordered_by_id' => 4,
        ])
        ->assertSessionHasErrors('venue_id');
});

it('maps api show date validation errors to show_dates field', function () {
    Http::fake([
        ordersStoreApiUrl() => Http::response([
            'message' => 'Validation failed.',
            'errors' => [
                'show_dates.0.show_date' => ['The show date is invalid.'],
            ],
        ], 422),
    ]);

    $this->actingAsBff(bffStaffSessionUser())
        ->post(route('orders.store'), [
            'tour_id' => 1,
            'venue_id' => 2,
            'due_date' => '2026-06-01',
            'show_dates' => ['2026-06-01'],
            'ordered_by_id' => 4,
        ])
        ->assertSessionHasErrors('show_dates');
});

it('redirects guests to login when creating an order', function () {
    $this->post(route('orders.store'), [
        'tour_id' => 1,
        'venue_id' => 2,
        'due_date' => '2026-06-01',
        'show_dates' => ['2026-06-01'],
    ])
        ->assertRedirect(route('login'));

    Http::assertNothingSent();
});
