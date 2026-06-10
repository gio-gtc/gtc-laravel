<?php

use Illuminate\Support\Facades\Http;

function clientsApiUrl(): string
{
    return rtrim((string) config('services.api.base_url'), '/').'/api/clients';
}

it('proxies browse-all clients to gtc-api without query params', function () {
    Http::fake([
        clientsApiUrl() => Http::response([
            'data' => [
                [
                    'id' => 2,
                    'first_name' => 'Alexander',
                    'last_name' => 'Needham',
                    'email' => 'aneedham@cyberdyne.com',
                    'avatar' => null,
                    'organisation_id' => 2,
                ],
            ],
        ], 200),
    ]);

    $this->actingAsBff()
        ->getJson(route('api.clients.index'))
        ->assertOk()
        ->assertJsonPath('clients.0.id', 2)
        ->assertJsonPath('clients.0.first_name', 'Alexander');

    Http::assertSent(function ($request) {
        return $request->url() === clientsApiUrl()
            && $request->method() === 'GET'
            && $request->data() === [];
    });
});

it('returns 422 without calling api when q is too short', function () {
    Http::fake();

    $this->actingAsBff()
        ->getJson(route('api.clients.index', ['q' => 'a']))
        ->assertUnprocessable()
        ->assertJsonPath('message', 'The search term must be at least 2 characters.')
        ->assertJsonPath('errors.q.0', 'The search term must be at least 2 characters.');

    Http::assertNothingSent();
});

it('proxies client search to gtc-api with q param and unwraps data envelope', function () {
    Http::fake([
        clientsApiUrl().'?q=ali' => Http::response([
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
        ->getJson(route('api.clients.index', ['q' => 'ali']))
        ->assertOk()
        ->assertJsonPath('clients.0.id', 14)
        ->assertJsonPath('clients.0.first_name', 'Alice');

    Http::assertSent(function ($request) {
        return $request->url() === clientsApiUrl().'?q=ali'
            && $request->method() === 'GET'
            && $request->hasHeader('Authorization', 'Bearer test-bff-token');
    });
});

it('forwards 403 from gtc-api for clients index', function () {
    Http::fake([
        clientsApiUrl() => Http::response([
            'message' => 'Forbidden.',
        ], 403),
    ]);

    $this->actingAsBff()
        ->getJson(route('api.clients.index'))
        ->assertForbidden()
        ->assertJsonPath('message', 'Forbidden.');
});
