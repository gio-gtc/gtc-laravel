<?php

use Illuminate\Support\Facades\Http;

require_once __DIR__.'/OrderItemFixtures.php';

it('proxies json update order item to gtc-api', function () {
    Http::fake([
        apiOrderItemUrl(200) => Http::response([
            'message' => 'Line item updated.',
            'data' => array_merge(samplePolymorphicBroadcastOrderItem(), [
                'due_date' => '2026-08-20',
                'revision_number' => 1,
                'specifiable' => array_merge(
                    samplePolymorphicBroadcastOrderItem()['specifiable'],
                    [
                        'cut' => 'Week of',
                        'duration_seconds' => 15,
                        'language' => 'Spanish',
                        'isci' => 'ISCI-ABCDEFGHR1',
                    ],
                ),
            ]),
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
        ->assertJsonPath('order_item.specifiable.language', 'Spanish')
        ->assertJsonPath('order_item.revision_number', 1)
        ->assertJsonPath('order_item.specifiable.isci', 'ISCI-ABCDEFGHR1');

    Http::assertSent(function ($request) {
        if ($request->url() !== apiOrderItemUrl(200) || $request->method() !== 'PATCH') {
            return false;
        }

        $body = $request->data();

        return $body['due_date'] === '2026-08-20'
            && $body['specifications']['duration_seconds'] === 15
            && $body['specifications']['language'] === 'Spanish';
    });
});

it('normalizes canceled status lookup to cancelled in update response', function () {
    $item = samplePolymorphicBroadcastOrderItem();
    $item['status_lookup']['name'] = 'Canceled';

    Http::fake([
        apiOrderItemUrl(200) => Http::response([
            'message' => 'Line item updated.',
            'data' => $item,
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
        ->assertJsonPath('order_item.status_lookup.name', 'Cancelled');
});

it('forwards 422 validation errors from gtc-api for json order item update', function () {
    Http::fake([
        apiOrderItemUrl(200) => Http::response([
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
