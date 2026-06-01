<?php

use Illuminate\Support\Facades\Http;

function clientsSearchApiUrl(): string
{
    return rtrim((string) config('services.api.base_url'), '/').'/api/clients';
}

it('returns empty clients without calling api when search is too short', function () {
    Http::fake();

    $this->actingAsBff()
        ->get('/api/search/clients?search=a')
        ->assertOk()
        ->assertJson(['clients' => []]);

    Http::assertNothingSent();
});

it('proxies client search to gtc-api and unwraps data envelope', function () {
    Http::fake([
        clientsSearchApiUrl().'?search=ali' => Http::response([
            'data' => [
                [
                    'id' => 14,
                    'first_name' => 'Alice',
                    'last_name' => 'Cooper',
                    'email' => 'alice@universal.com',
                    'organisation_id' => 3,
                    'organisation' => [
                        'id' => 3,
                        'name' => 'Universal Music Group',
                    ],
                ],
            ],
        ], 200),
    ]);

    $this->actingAsBff()
        ->get('/api/search/clients?search=ali')
        ->assertOk()
        ->assertJsonPath('clients.0.id', 14)
        ->assertJsonPath('clients.0.first_name', 'Alice');

    Http::assertSent(function ($request) {
        return $request->url() === clientsSearchApiUrl().'?search=ali'
            && $request->method() === 'GET'
            && $request->hasHeader('Authorization', 'Bearer test-bff-token');
    });
});
