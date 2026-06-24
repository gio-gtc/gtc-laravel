<?php

use Illuminate\Support\Facades\Http;

function apiOrderCartClearUrl(int $orderId): string
{
    return rtrim((string) config('services.api.base_url'), '/')."/api/orders/{$orderId}/cart";
}

it('proxies json order cart clear to gtc-api when items remain', function () {
    Http::fake([
        apiOrderCartClearUrl(4) => Http::response([
            'message' => 'Successfully cleared 3 unsubmitted items from the cart.',
            'order_deleted' => false,
            'count' => 3,
        ], 200),
    ]);

    $this->actingAsBff()
        ->deleteJson(route('api.orders.cart.clear', ['order' => 4]))
        ->assertOk()
        ->assertJsonPath('message', 'Successfully cleared 3 unsubmitted items from the cart.')
        ->assertJsonPath('order_deleted', false)
        ->assertJsonPath('count', 3);

    Http::assertSent(function ($request) {
        return $request->url() === apiOrderCartClearUrl(4)
            && $request->method() === 'DELETE';
    });
});

it('proxies json order cart clear when order shell is deleted', function () {
    Http::fake([
        apiOrderCartClearUrl(4) => Http::response([
            'message' => 'Successfully removed 2 items and cleared empty order shell.',
            'order_deleted' => true,
            'count' => 2,
        ], 200),
    ]);

    $this->actingAsBff()
        ->deleteJson(route('api.orders.cart.clear', ['order' => 4]))
        ->assertOk()
        ->assertJsonPath('message', 'Successfully removed 2 items and cleared empty order shell.')
        ->assertJsonPath('order_deleted', true)
        ->assertJsonPath('count', 2);
});

it('surfaces api conflict when json cart clear has no cart items', function () {
    Http::fake([
        apiOrderCartClearUrl(4) => Http::response([
            'message' => 'Conflict: No items marked "Still In Cart" were found in this order context.',
        ], 409),
    ]);

    $this->actingAsBff()
        ->deleteJson(route('api.orders.cart.clear', ['order' => 4]))
        ->assertStatus(409)
        ->assertJsonPath(
            'message',
            'Conflict: No items marked "Still In Cart" were found in this order context.',
        );
});
