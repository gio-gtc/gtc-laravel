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
                        'locked_price' => '940.83',
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
                'subtotal' => '940.83',
                'tax' => '0.00',
                'total' => '940.83',
                'payment_due' => null,
                'created_at' => '2026-06-22T21:12:16.000000Z',
                'updated_at' => '2026-06-22T21:12:16.000000Z',
                'lines' => [
                    [
                        'id' => 14,
                        'invoice_id' => 12,
                        'order_item_id' => 1,
                        'description' => 'Key Art Package 1920×1080',
                        'unit_price' => '940.83',
                        'quantity' => 1,
                        'total' => '940.83',
                        'created_at' => '2026-06-22T21:12:16.000000Z',
                        'updated_at' => '2026-06-22T21:12:16.000000Z',
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
        ->assertJsonPath('invoice.total', '940.83')
        ->assertJsonPath('invoice.payment_due', null)
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

function sampleVideoSubmitApiResponse(int $orderId = 5): array
{
    return [
        'message' => 'Order submitted successfully.',
        'order' => [
            'id' => $orderId,
            'tour_id' => 1,
            'venue_id' => 1,
            'ordered_by_id' => 1,
            'is_demo' => false,
            'uuid' => 'b9d37b8a-5591-51de-902e-f86710daaf6c',
            'status' => 'In Progress',
            'due_date' => '2026-07-13',
            'created_at' => '2026-06-22T20:45:09.000000Z',
            'updated_at' => '2026-06-22T21:12:16.000000Z',
            'order_items' => [],
        ],
        'invoice' => [
            'id' => 13,
            'order_id' => $orderId,
            'organisation_id' => 1,
            'document_number' => '975951',
            'status' => 'Held',
            'subtotal' => '825.00',
            'tax' => '0.00',
            'total' => '825.00',
            'payment_due' => null,
            'created_at' => '2026-06-22T21:12:16.000000Z',
            'updated_at' => '2026-06-22T21:12:16.000000Z',
            'lines' => [
                [
                    'id' => 15,
                    'invoice_id' => 13,
                    'order_item_id' => 69,
                    'description' => 'Broadcast & Streaming Video Details - First Cut',
                    'unit_price' => '575.00',
                    'quantity' => 1,
                    'total' => '575.00',
                    'created_at' => '2026-06-22T21:12:16.000000Z',
                    'updated_at' => '2026-06-22T21:12:16.000000Z',
                ],
                [
                    'id' => 16,
                    'invoice_id' => 13,
                    'order_item_id' => null,
                    'description' => 'Encoding',
                    'unit_price' => '250.00',
                    'quantity' => 1,
                    'total' => '250.00',
                    'created_at' => '2026-06-22T21:12:16.000000Z',
                    'updated_at' => '2026-06-22T21:12:16.000000Z',
                ],
                [
                    'id' => 17,
                    'invoice_id' => 13,
                    'order_item_id' => null,
                    'description' => 'Encoding',
                    'unit_price' => '0.00',
                    'quantity' => 1,
                    'total' => '0.00',
                    'created_at' => '2026-06-22T21:12:16.000000Z',
                    'updated_at' => '2026-06-22T21:12:16.000000Z',
                ],
            ],
        ],
    ];
}

it('forwards video invoice lines including zero-dollar encoding rows', function () {
    Http::fake([
        apiOrderSubmitUrl(5) => Http::response(sampleVideoSubmitApiResponse(5), 200),
    ]);

    $this->actingAsBff()
        ->postJson(route('api.orders.submit', ['order' => 5]))
        ->assertOk()
        ->assertJsonPath(
            'invoice.lines.0.description',
            'Broadcast & Streaming Video Details - First Cut',
        )
        ->assertJsonPath('invoice.lines.1.description', 'Encoding')
        ->assertJsonPath('invoice.lines.1.total', '250.00')
        ->assertJsonPath('invoice.lines.2.description', 'Encoding')
        ->assertJsonPath('invoice.lines.2.total', '0.00');
});
