<?php

use App\Support\BffAuthSession;
use Illuminate\Support\Facades\Http;

it('clears bff session and returns 401 when gtc-api rejects the token', function () {
    Http::fake([
        config('services.api.base_url').'/api/staff' => Http::response(
            ['message' => 'Unauthenticated.'],
            401,
        ),
    ]);

    $response = $this->withSession([
        'api_token' => 'invalid-token',
        'user' => ['id' => 1, 'email' => 'user@example.com'],
    ])->getJson('/api/staff');

    $response->assertUnauthorized();
    $response->assertJson([
        'message' => BffAuthSession::EXPIRED_MESSAGE,
    ]);
});

it('redirects to login when gtc-api rejects the token on an inertia page', function () {
    Http::fake([
        config('services.api.base_url').'/api/tours*' => Http::response(
            ['message' => 'Unauthenticated.'],
            401,
        ),
    ]);

    $response = $this->withSession([
        'api_token' => 'invalid-token',
        'user' => ['id' => 1, 'email' => 'user@example.com'],
    ])->get('/orders');

    $response->assertRedirect(route('login'));
});
