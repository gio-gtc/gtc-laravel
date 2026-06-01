<?php

use Illuminate\Support\Facades\Http;

function ordersStoreApiUrl(): string
{
    return rtrim((string) config('services.api.base_url'), '/').'/api/orders';
}

it('proxies staff create order to gtc-api with mapped payload', function () {
    Http::fake([
        ordersStoreApiUrl() => Http::response([
            'data' => ['id' => 99],
        ], 201),
    ]);

    $this->actingAsBff(['organisation_id' => 1, 'id' => 10])
        ->post(route('orders.store'), [
            'tour_id' => 12,
            'venue_id' => 84,
            'due_date' => '2026-10-20',
            'show_date' => '2026-10-15',
            'local_deliverable_email' => 'client@example.com',
            'ordered_by_id' => 4,
        ])
        ->assertRedirect(route('orders'))
        ->assertSessionHas('success', 'Order created successfully.');

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

it('sets ordered_by_id from session for client users', function () {
    Http::fake([
        ordersStoreApiUrl() => Http::response(['data' => ['id' => 100]], 201),
    ]);

    $this->actingAsBff(['organisation_id' => 5, 'id' => 42])
        ->post(route('orders.store'), [
            'tour_id' => 3,
            'venue_id' => 10,
            'due_date' => '2026-11-01',
            'show_date' => '2026-11-01',
            'local_deliverable_email' => '',
        ])
        ->assertRedirect(route('orders'));

    Http::assertSent(fn ($request) => $request->url() === ordersStoreApiUrl()
        && ($request->data()['ordered_by_id'] ?? null) === 42);
});

it('requires ordered_by_id for staff', function () {
    Http::fake();

    $this->actingAsBff(['organisation_id' => 1])
        ->post(route('orders.store'), [
            'tour_id' => 1,
            'venue_id' => 2,
            'due_date' => '2026-06-01',
            'show_date' => '2026-06-01',
        ])
        ->assertSessionHasErrors('ordered_by_id');

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

    $this->actingAsBff(['organisation_id' => 1, 'id' => 10])
        ->post(route('orders.store'), [
            'tour_id' => 1,
            'venue_id' => 999,
            'due_date' => '2026-06-01',
            'show_date' => '2026-06-01',
            'ordered_by_id' => 4,
        ])
        ->assertSessionHasErrors('venue_id');
});

it('redirects guests to login when creating an order', function () {
    $this->post(route('orders.store'), [
        'tour_id' => 1,
        'venue_id' => 2,
        'due_date' => '2026-06-01',
        'show_date' => '2026-06-01',
    ])
        ->assertRedirect(route('login'));

    Http::assertNothingSent();
});
