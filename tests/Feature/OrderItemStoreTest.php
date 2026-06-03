<?php

use Illuminate\Support\Facades\Http;

function orderItemStoreApiUrl(int $orderId): string
{
    return rtrim((string) config('services.api.base_url'), '/')."/api/orders/{$orderId}/items";
}

it('proxies add order item to gtc-api', function () {
    Http::fake([
        orderItemStoreApiUrl(1) => Http::response([
            'data' => [
                'id' => 200,
                'order_id' => 1,
                'order_menu_item_id' => 4,
                'order_item_status_id' => 1,
                'status' => 'Still In Cart',
                'due_date' => '2026-10-15',
                'specifications' => ['isci' => 'GTC000200'],
            ],
        ], 201),
    ]);

    $this->actingAsBff()
        ->post(route('orders.items.store', ['order' => 1]), [
            'order_menu_item_id' => 4,
            'due_date' => '2026-10-15',
            'specifications' => [
                'type' => 'Social - 16:9',
                'cut' => 'On Sale Now',
            ],
        ])
        ->assertRedirect(route('orders'))
        ->assertSessionHas('success', 'Line item added successfully.')
        ->assertSessionHas('created_order_item');

    Http::assertSent(function ($request) {
        if ($request->url() !== orderItemStoreApiUrl(1) || $request->method() !== 'POST') {
            return false;
        }

        $body = $request->data();

        return $body['order_menu_item_id'] === 4
            && $body['due_date'] === '2026-10-15'
            && $body['specifications']['type'] === 'Social - 16:9';
    });
});
