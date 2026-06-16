<?php

use Illuminate\Support\Facades\Http;

require_once __DIR__.'/OrderItemFixtures.php';

it('proxies json add order item to gtc-api', function () {
    Http::fake([
        apiOrderItemsStoreUrl(1) => Http::response([
            'message' => 'Line item created.',
            'data' => samplePolymorphicBroadcastOrderItem(),
        ], 201),
    ]);

    $this->actingAsBff()
        ->postJson(route('api.orders.items.store', ['order' => 1]), [
            'order_menu_item_id' => 1,
            'due_date' => '2026-07-25',
            'specifications' => [
                'type' => 'Generic',
                'cut' => 'On Sale Now',
                'duration_seconds' => '30',
                'language' => 'English',
                'encoding' => ['Station MP4 (Broadcast)'],
            ],
        ])
        ->assertCreated()
        ->assertJsonPath('order_item.id', 200)
        ->assertJsonPath('order_item.specifiable.encoding.0', 'Station MP4 (Broadcast)')
        ->assertJsonPath('order_item.status_lookup.name', 'Still In Cart')
        ->assertJsonPath('order_item.specifiable.asset_tracking.Voice Over', false);

    Http::assertSent(function ($request) {
        if ($request->url() !== apiOrderItemsStoreUrl(1) || $request->method() !== 'POST') {
            return false;
        }

        $body = $request->data();

        return $body['order_menu_item_id'] === 1
            && $body['due_date'] === '2026-07-25'
            && $body['specifications']['duration_seconds'] === '30'
            && $body['specifications']['encoding'] === ['Station MP4 (Broadcast)']
            && $body['specifications']['language'] === 'English';
    });
});

it('forwards 422 validation errors from gtc-api for json order item store', function () {
    Http::fake([
        apiOrderItemsStoreUrl(1) => Http::response([
            'message' => 'The given data was invalid.',
            'errors' => [
                'specifications.encoding' => ['The encoding field is required.'],
            ],
        ], 422),
    ]);

    $this->actingAsBff()
        ->postJson(route('api.orders.items.store', ['order' => 1]), [
            'order_menu_item_id' => 1,
            'due_date' => '2026-07-25',
            'specifications' => [
                'type' => 'Generic',
                'cut' => 'On Sale Now',
                'duration_seconds' => '30',
                'language' => 'English',
            ],
        ])
        ->assertUnprocessable()
        ->assertJsonFragment([
            'specifications.encoding' => [
                'The encoding field is required.',
            ],
        ]);
});
