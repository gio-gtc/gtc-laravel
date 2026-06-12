<?php

use Illuminate\Support\Facades\Http;

require_once __DIR__.'/OrderItemFixtures.php';

it('proxies revision request to gtc-api', function () {
    Http::fake([
        apiOrderItemReviseUrl(401) => Http::response([
            'message' => 'Item revision successfully initialized.',
            'data' => array_merge(samplePolymorphicBroadcastOrderItem(402), [
                'order_item_status_id' => 5,
                'revision_number' => 1,
                'status_lookup' => [
                    'id' => 5,
                    'name' => 'Revision Request',
                    'order_status_id' => 2,
                ],
            ]),
        ], 201),
    ]);

    $this->actingAsBff()
        ->postJson(route('api.order-items.revise', ['orderItem' => 401]), [
            'comment' => 'The bass in the background audio track is clipping.',
        ])
        ->assertCreated()
        ->assertJsonPath('message', 'Item revision successfully initialized.')
        ->assertJsonPath('order_item.id', 402)
        ->assertJsonPath('order_item.revision_number', 1)
        ->assertJsonPath('order_item.status_lookup.name', 'Revision Request');

    Http::assertSent(function ($request) {
        if ($request->url() !== apiOrderItemReviseUrl(401) || $request->method() !== 'POST') {
            return false;
        }

        $body = $request->data();

        return $body['comment'] === 'The bass in the background audio track is clipping.';
    });
});

it('requires comment for revision request', function () {
    $this->actingAsBff()
        ->postJson(route('api.order-items.revise', ['orderItem' => 401]), [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['comment']);
});

it('forwards 422 validation errors from gtc-api for revision request', function () {
    Http::fake([
        apiOrderItemReviseUrl(401) => Http::response([
            'message' => 'The given data was invalid.',
            'errors' => [
                'comment' => ['Comment is required.'],
            ],
        ], 422),
    ]);

    $this->actingAsBff()
        ->postJson(route('api.order-items.revise', ['orderItem' => 401]), [
            'comment' => 'Please fix the audio.',
        ])
        ->assertUnprocessable()
        ->assertJsonFragment([
            'comment' => ['Comment is required.'],
        ]);
});
