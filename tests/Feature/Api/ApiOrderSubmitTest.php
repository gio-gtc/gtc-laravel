<?php

use Illuminate\Support\Facades\Http;

function apiOrderSubmitUrl(int $orderId): string
{
    return rtrim((string) config('services.api.base_url'), '/')."/api/orders/{$orderId}/submit";
}

function sampleSubmitApiResponse(int $orderId = 4): array
{
    return [
        'message' => 'Order submitted successfully.',
        'data' => [
            'order' => [
                'id' => $orderId,
                'tour_id' => 1,
                'venue_id' => 1,
                'ordered_by_id' => 1,
                'is_demo' => false,
                'uuid' => 'a8c26a79-4480-42cb-901d-e75609daae5b',
                'status' => 'In Progress',
                'due_date' => '2026-07-13',
                'created_at' => '2026-06-22T20:45:09.000000Z',
                'updated_at' => '2026-06-22T21:12:16.000000Z',
                'order_items' => [
                    [
                        'id' => 1,
                        'order_id' => $orderId,
                        'order_menu_item_id' => 4,
                        'order_item_status_id' => 2,
                        'invoice_line_id' => 14,
                        'description' => 'Key Art Package 1920×1080',
                        'locked_price' => 940.83,
                        'created_at' => '2026-06-22T20:45:10.000000Z',
                        'updated_at' => '2026-06-22T21:12:16.000000Z',
                    ],
                ],
            ],
            'invoice' => [
                'id' => 12,
                'order_id' => $orderId,
                'organisation_id' => 1,
                'document_number' => '975950',
                'status' => 'Held',
                'subtotal_cents' => 94083,
                'tax_cents' => 0,
                'total_cents' => 94083,
                'payment_due' => null,
                'created_at' => '2026-06-22T21:12:16.000000Z',
                'updated_at' => '2026-06-22T21:12:16.000000Z',
                'lines' => [
                    [
                        'id' => 14,
                        'invoice_id' => 12,
                        'order_item_id' => 1,
                        'description' => 'Key Art Package 1920×1080',
                        'unit_price_cents' => 94083,
                        'quantity' => 1,
                        'total_cents' => 94083,
                        'created_at' => '2026-06-22T21:12:16.000000Z',
                        'updated_at' => '2026-06-22T21:12:16.000000Z',
                        'price' => 940.83,
                    ],
                ],
            ],
        ],
    ];
}

it('proxies json order submit to gtc-api', function () {
    Http::fake([
        apiOrderSubmitUrl(4) => Http::response(sampleSubmitApiResponse(4), 200),
    ]);

    $this->actingAsBff()
        ->postJson(route('api.orders.submit', ['order' => 4]))
        ->assertOk()
        ->assertJsonPath('message', 'Order submitted successfully.')
        ->assertJsonPath('order.id', 4)
        ->assertJsonPath('invoice.document_number', '975950')
        ->assertJsonPath('invoice.total_cents', 94083)
        ->assertJsonPath('invoice.lines.0.description', 'Key Art Package 1920×1080');

    Http::assertSent(function ($request) {
        return $request->url() === apiOrderSubmitUrl(4)
            && $request->method() === 'POST';
    });
});

it('surfaces api conflict when json submit has no cart items', function () {
    Http::fake([
        apiOrderSubmitUrl(4) => Http::response([
            'message' => 'Conflict: No items found in cart for this order context.',
        ], 409),
    ]);

    $this->actingAsBff()
        ->postJson(route('api.orders.submit', ['order' => 4]))
        ->assertStatus(409)
        ->assertJsonPath(
            'message',
            'Conflict: No items found in cart for this order context.',
        );
});
