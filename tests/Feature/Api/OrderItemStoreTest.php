<?php

use Illuminate\Support\Facades\Http;

function apiOrderItemStoreUrl(int $orderId): string
{
    return rtrim((string) config('services.api.base_url'), '/')."/api/orders/{$orderId}/items";
}

it('proxies json add order item to gtc-api', function () {
    Http::fake([
        apiOrderItemStoreUrl(1) => Http::response([
            'message' => 'Line item created.',
            'data' => [
                'id' => 200,
                'order_id' => 1,
                'order_menu_item_id' => 1,
                'order_item_status_id' => 1,
                'status' => 'Still In Cart',
                'due_date' => '2026-07-25',
                'specifications' => [
                    'type' => 'Generic',
                    'cut' => 'On Sale Now',
                    'duration_seconds' => 30,
                    'language' => 'English',
                    'encoding' => 'Station MP4 (Broadcast)',
                    'isci' => 'GTC000200',
                ],
            ],
        ], 201),
    ]);

    $this->actingAsBff()
        ->postJson(route('api.orders.items.store', ['order' => 1]), [
            'order_menu_item_id' => 1,
            'due_date' => '2026-07-25',
            'specifications' => [
                'type' => 'Generic',
                'cut' => 'On Sale Now',
                'duration_seconds' => 30,
                'language' => 'English',
                'encoding' => 'Station MP4 (Broadcast)',
            ],
        ])
        ->assertCreated()
        ->assertJsonPath('order_item.id', 200)
        ->assertJsonPath('order_item.specifications.encoding', 'Station MP4 (Broadcast)');

    Http::assertSent(function ($request) {
        if ($request->url() !== apiOrderItemStoreUrl(1) || $request->method() !== 'POST') {
            return false;
        }

        $body = $request->data();

        return $body['order_menu_item_id'] === 1
            && $body['due_date'] === '2026-07-25'
            && $body['specifications']['duration_seconds'] === 30
            && $body['specifications']['language'] === 'English';
    });
});

it('forwards 422 validation errors from gtc-api for json order item store', function () {
    Http::fake([
        apiOrderItemStoreUrl(1) => Http::response([
            'message' => 'The given data was invalid.',
            'errors' => [
                'specifications.encoding' => ['Encoding is required when encoding_custom is absent.'],
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
                'duration_seconds' => 30,
                'language' => 'English',
            ],
        ])
        ->assertUnprocessable()
        ->assertJsonFragment([
            'specifications.encoding' => [
                'Encoding is required when encoding_custom is absent.',
            ],
        ]);
});
