<?php

use Illuminate\Support\Facades\Http;

function venuesSearchApiUrl(): string
{
    return rtrim((string) config('services.api.base_url'), '/').'/api/venues';
}

it('proxies venue search to gtc-api with bearer token', function () {
    Http::fake([
        venuesSearchApiUrl().'*' => Http::response([
            'venues' => [
                [
                    'id' => 84,
                    'name' => 'SoFi Stadium',
                    'city' => 'Inglewood',
                    'state' => 'CA',
                    'country_id' => 1,
                ],
            ],
        ], 200),
    ]);

    $this->actingAsBff()
        ->get(route('search.venues', ['search' => 'sofi']))
        ->assertOk()
        ->assertJson([
            'venues' => [
                [
                    'id' => 84,
                    'name' => 'SoFi Stadium',
                    'city' => 'Inglewood',
                    'state' => 'CA',
                    'country_id' => 1,
                ],
            ],
        ]);

    Http::assertSent(function ($request) {
        return $request->url() === venuesSearchApiUrl().'?search=sofi'
            && $request->method() === 'GET'
            && $request->hasHeader('Authorization', 'Bearer test-bff-token');
    });
});

it('forwards empty search for baseline venue suggestions', function () {
    Http::fake([
        venuesSearchApiUrl().'*' => Http::response([
            'venues' => [
                [
                    'id' => 1,
                    'name' => 'Alpha Arena',
                    'city' => 'Austin',
                    'state' => 'TX',
                    'country_id' => 1,
                ],
            ],
        ], 200),
    ]);

    $this->actingAsBff()
        ->get(route('search.venues'))
        ->assertOk()
        ->assertJsonPath('venues.0.name', 'Alpha Arena');

    Http::assertSent(function ($request) {
        return $request->url() === venuesSearchApiUrl()
            && $request->method() === 'GET';
    });
});

it('returns empty venues when gtc-api fails', function () {
    Http::fake([
        venuesSearchApiUrl().'*' => Http::response(['message' => 'Unavailable'], 503),
    ]);

    $this->actingAsBff()
        ->get(route('search.venues', ['search' => 'msg']))
        ->assertOk()
        ->assertExactJson(['venues' => []]);
});

it('redirects guests to login when searching venues', function () {
    $this->get(route('search.venues', ['search' => 'msg']))
        ->assertRedirect(route('login'));

    Http::assertNothingSent();
});
