<?php

use Illuminate\Support\Facades\Http;

function apiOrderItemUpdateUrl(int $orderItemId): string
{
    return rtrim((string) config('services.api.base_url'), '/')."/api/order-items/{$orderItemId}";
}

it('proxies json update order item to gtc-api', function () {
    Http::fake([
        apiOrderItemUpdateUrl(200) => Http::response([
            'message' => 'Line item updated.',
            'data' => [
                'id' => 200,
                'order_id' => 1,
                'order_menu_item_id' => 1,
                'order_item_status_id' => 1,
                'status' => 'Still In Cart',
                'due_date' => '2026-08-20',
                'specifications' => [
                    'type' => 'Generic',
                    'cut' => 'Week of',
                    'duration_seconds' => 15,
                    'language' => 'Spanish',
                    'encoding' => 'Station MP4 (Broadcast)',
                    'isci' => 'GTC000200',
                ],
            ],
        ], 200),
    ]);

    $this->actingAsBff()
        ->patchJson(route('api.order-items.update', ['orderItem' => 200]), [
            'due_date' => '2026-08-20',
            'specifications' => [
                'type' => 'Generic',
                'cut' => 'Week of',
                'duration_seconds' => 15,
                'language' => 'Spanish',
                'encoding' => 'Station MP4 (Broadcast)',
            ],
        ])
        ->assertOk()
        ->assertJsonPath('order_item.id', 200)
        ->assertJsonPath('order_item.specifications.language', 'Spanish');

    Http::assertSent(function ($request) {
        if ($request->url() !== apiOrderItemUpdateUrl(200) || $request->method() !== 'PATCH') {
            return false;
        }

        $body = $request->data();

        return $body['due_date'] === '2026-08-20'
            && $body['specifications']['duration_seconds'] === 15
            && $body['specifications']['language'] === 'Spanish';
    });
});

it('forwards 422 validation errors from gtc-api for json order item update', function () {
    Http::fake([
        apiOrderItemUpdateUrl(200) => Http::response([
            'message' => 'The given data was invalid.',
            'errors' => [
                'specifications.encoding' => ['Encoding is required when encoding_custom is absent.'],
            ],
        ], 422),
    ]);

    $this->actingAsBff()
        ->patchJson(route('api.order-items.update', ['orderItem' => 200]), [
            'due_date' => '2026-08-20',
            'specifications' => [
                'type' => 'Generic',
                'cut' => 'Week of',
                'duration_seconds' => 15,
                'language' => 'Spanish',
            ],
        ])
        ->assertUnprocessable()
        ->assertJsonFragment([
            'specifications.encoding' => [
                'Encoding is required when encoding_custom is absent.',
            ],
        ]);
});
