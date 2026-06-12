<?php

use Illuminate\Support\Facades\Http;

require_once __DIR__.'/OrderItemFixtures.php';

it('proxies json delete order item to gtc-api', function () {
    $item = samplePolymorphicBroadcastOrderItem();
    $item['order_item_status_id'] = 7;
    $item['status_lookup'] = [
        'id' => 7,
        'name' => 'Cancelled',
        'order_status_id' => 5,
    ];

    Http::fake([
        apiOrderItemUrl(200) => Http::response([
            'message' => 'Line item removed.',
            'data' => $item,
        ], 200),
    ]);

    $this->actingAsBff()
        ->deleteJson(route('api.order-items.delete', ['orderItem' => 200]))
        ->assertOk()
        ->assertJsonPath('order_item.id', 200)
        ->assertJsonPath('order_item.status_lookup.name', 'Cancelled');

    Http::assertSent(function ($request) {
        return $request->url() === apiOrderItemUrl(200)
            && $request->method() === 'DELETE';
    });
});

it('forwards 404 from gtc-api for json order item delete', function () {
    Http::fake([
        apiOrderItemUrl(999) => Http::response([
            'message' => 'Order item not found.',
        ], 404),
    ]);

    $this->actingAsBff()
        ->deleteJson(route('api.order-items.delete', ['orderItem' => 999]))
        ->assertNotFound()
        ->assertJsonPath('message', 'Order item not found.');
});

it('forwards 409 from gtc-api when order item cannot be removed', function () {
    Http::fake([
        apiOrderItemUrl(200) => Http::response([
            'message' => 'Only cart line items can be removed.',
        ], 409),
    ]);

    $this->actingAsBff()
        ->deleteJson(route('api.order-items.delete', ['orderItem' => 200]))
        ->assertStatus(409)
        ->assertJsonPath('message', 'Only cart line items can be removed.');
});
