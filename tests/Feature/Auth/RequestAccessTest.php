<?php

use Illuminate\Support\Facades\Http;

it('proxies request access to the API and redirects to login without a session token', function () {
    Http::fake(fn () => Http::response([
        'message' => 'Request received.',
    ], 200));

    $response = $this->post('/request-access', [
        'first_name' => 'Jane',
        'last_name' => 'Doe',
        'email' => 'jane@example.com',
        'organisation' => 'Acme Inc',
        'job_title' => 'Buyer',
        'phone_number' => '+15555550100',
        'details' => 'Need access to place venue orders.',
    ]);

    $response->assertSessionDoesntHaveErrors();
    $response->assertRedirect(route('login'));
    $response->assertSessionMissing('api_token');
});

it('passes API validation errors back to Inertia', function () {
    Http::fake(fn () => Http::response([
        'message' => 'The given data was invalid.',
        'errors' => [
            'email' => ['The email has already been registered.'],
        ],
    ], 422));

    $response = $this->post('/request-access', [
        'first_name' => 'Jane',
        'last_name' => 'Doe',
        'email' => 'taken@example.com',
        'organisation' => 'Acme Inc',
        'job_title' => 'Buyer',
        'phone_number' => '+15555550100',
        'details' => 'Need access.',
    ]);

    $response->assertInvalid([
        'email' => 'The email has already been registered.',
    ]);
});
