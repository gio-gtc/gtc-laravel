<?php

use Illuminate\Support\Facades\Http;

require_once __DIR__.'/Api/OrderItemFixtures.php';

it('proxies add order item to gtc-api', function () {
    Http::fake([
        apiOrderItemsStoreUrl(1) => Http::response([
            'data' => samplePolymorphicBroadcastOrderItem(),
        ], 201),
    ]);

    $this->actingAsBff()
        ->post(route('orders.items.store', ['order' => 1]), [
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
        ->assertRedirect(route('orders'))
        ->assertSessionHas('success', 'Line item added successfully.')
        ->assertSessionHas('created_order_item');

    $created = session('created_order_item');
    expect($created)->toBeArray()
        ->and($created['specifiable']['encoding'])->toBe(['Station MP4 (Broadcast)'])
        ->and($created['status_lookup']['name'])->toBe('Still In Cart')
        ->and($created['specifiable']['asset_tracking']['Voice Over'])->toBeFalse();

    Http::assertSent(function ($request) {
        if ($request->url() !== apiOrderItemsStoreUrl(1) || $request->method() !== 'POST') {
            return false;
        }

        $body = $request->data();

        return $body['order_menu_item_id'] === 1
            && $body['due_date'] === '2026-07-25'
            && $body['specifications']['duration_seconds'] === '30';
    });
});

it('normalizes canceled status lookup to cancelled in legacy store flash', function () {
    $item = samplePolymorphicBroadcastOrderItem();
    $item['status_lookup']['name'] = 'Canceled';

    Http::fake([
        apiOrderItemsStoreUrl(1) => Http::response([
            'data' => $item,
        ], 201),
    ]);

    $this->actingAsBff()
        ->post(route('orders.items.store', ['order' => 1]), [
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
        ->assertRedirect(route('orders'));

    expect(session('created_order_item.status_lookup.name'))->toBe('Cancelled');
});
