<?php

use Illuminate\Support\Facades\Http;

function orderSubmitApiUrl(int $orderId): string
{
    return rtrim((string) config('services.api.base_url'), '/')."/api/orders/{$orderId}/submit";
}

it('proxies order submit to gtc-api', function () {
    Http::fake([
        orderSubmitApiUrl(5) => Http::response(['data' => ['status' => 'In Progress']], 200),
    ]);

    $this->actingAsBff()
        ->post(route('orders.submit', ['order' => 5]))
        ->assertRedirect(route('orders'))
        ->assertSessionHas('success', 'Order submitted successfully.')
        ->assertSessionHas('submitted_order', ['id' => 5]);

    Http::assertSent(function ($request) {
        return $request->url() === orderSubmitApiUrl(5)
            && $request->method() === 'POST';
    });
});

it('surfaces api conflict when submit has no cart items', function () {
    Http::fake([
        orderSubmitApiUrl(5) => Http::response([
            'message' => 'No items in cart.',
        ], 409),
    ]);

    $this->actingAsBff()
        ->post(route('orders.submit', ['order' => 5]))
        ->assertRedirect(route('orders'))
        ->assertSessionHas('error', 'No items in cart.');
});
