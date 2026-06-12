<?php

use Illuminate\Support\Facades\Http;

require_once __DIR__.'/OrderItemFixtures.php';

it('proxies bulk update order items to gtc-api', function () {
    Http::fake([
        apiOrderItemsBulkUpdateUrl() => Http::response([
            'message' => 'Selected order line items batch-updated successfully.',
            'meta' => [
                'updated_items_count' => 3,
                'affected_orders' => [6],
            ],
        ], 200),
    ]);

    $this->actingAsBff()
        ->postJson(route('api.order-items.bulk-update'), [
            'order_item_ids' => [101, 102, 103],
            'due_date' => '2026-06-30',
        ])
        ->assertOk()
        ->assertJsonPath('message', 'Selected order line items batch-updated successfully.')
        ->assertJsonPath('meta.updated_items_count', 3)
        ->assertJsonPath('meta.affected_orders', [6]);

    Http::assertSent(function ($request) {
        if ($request->url() !== apiOrderItemsBulkUpdateUrl() || $request->method() !== 'POST') {
            return false;
        }

        $body = $request->data();

        return $body['order_item_ids'] === [101, 102, 103]
            && $body['due_date'] === '2026-06-30';
    });
});

it('proxies partial specifications bulk update to gtc-api', function () {
    Http::fake([
        apiOrderItemsBulkUpdateUrl() => Http::response([
            'message' => 'Selected order line items batch-updated successfully.',
            'meta' => [
                'updated_items_count' => 1,
                'affected_orders' => [6],
            ],
        ], 200),
    ]);

    $this->actingAsBff()
        ->postJson(route('api.order-items.bulk-update'), [
            'order_item_ids' => [101],
            'specifications' => [
                'duration_seconds' => 30,
            ],
        ])
        ->assertOk();

    Http::assertSent(function ($request) {
        $body = $request->data();

        return $body['order_item_ids'] === [101]
            && $body['specifications']['duration_seconds'] === 30;
    });
});

it('returns 422 when bulk update has no dirty fields', function () {
    $this->actingAsBff()
        ->postJson(route('api.order-items.bulk-update'), [
            'order_item_ids' => [101],
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['order_item_ids']);
});

it('forwards 422 validation errors from gtc-api for bulk update', function () {
    Http::fake([
        apiOrderItemsBulkUpdateUrl() => Http::response([
            'message' => 'The given data was invalid.',
            'errors' => [
                'order_item_ids' => ['One or more selected items are cancelled.'],
            ],
        ], 422),
    ]);

    $this->actingAsBff()
        ->postJson(route('api.order-items.bulk-update'), [
            'order_item_ids' => [101, 102],
            'due_date' => '2026-06-30',
        ])
        ->assertUnprocessable()
        ->assertJsonFragment([
            'order_item_ids' => [
                'One or more selected items are cancelled.',
            ],
        ]);
});
