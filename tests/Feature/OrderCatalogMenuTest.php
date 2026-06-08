<?php

use Illuminate\Support\Facades\Http;

function orderCatalogMenuApiUrl(): string
{
    return rtrim((string) config('services.api.base_url'), '/').'/api/order-catalog-menu';
}

it('proxies order catalog menu to gtc-api as json', function () {
    Http::fake([
        orderCatalogMenuApiUrl() => Http::response([
            'catalog' => [
                [
                    'id' => 1,
                    'name' => 'Broadcast & Streaming Video',
                    'order_menu_items' => [
                        [
                            'id' => 1,
                            'name' => 'Broadcast & Streaming Video Details',
                            'order_menu_category_id' => 1,
                            'form_blueprint' => [
                                'encodings' => ['Station MP4 (Broadcast)'],
                                'types' => [
                                    'Generic' => [
                                        'cuts' => ['On Sale Now'],
                                        'durations' => [30],
                                        'languages' => ['English'],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ], 200),
    ]);

    $this->actingAsBff()
        ->getJson(route('api.order-catalog-menu'))
        ->assertOk()
        ->assertJsonPath('data.0.order_menu_items.0.id', 1)
        ->assertJsonPath(
            'data.0.order_menu_items.0.form_blueprint.encodings.0',
            'Station MP4 (Broadcast)',
        );

    Http::assertSent(function ($request) {
        return $request->url() === orderCatalogMenuApiUrl()
            && $request->method() === 'GET';
    });
});

it('redirects unauthenticated order catalog menu requests to login', function () {
    $this->get(route('api.order-catalog-menu'))
        ->assertRedirect(route('login'));
});
