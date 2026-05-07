<?php

use Illuminate\Support\Facades\Http;

function bffSessionPayload(): array
{
    return [
        'api_token' => 'test-bff-token',
        'user' => [
            'id' => 1,
            'name' => 'Admin User',
            'email' => 'admin@example.com',
        ],
        'roles' => [],
        'permissions' => [],
    ];
}

it('proxies user invite and redirects back with success', function () {
    $apiUrl = config('services.api.base_url').'/api/users/invite';

    Http::fake([
        $apiUrl => Http::response(['message' => 'Invitation sent'], 200),
    ]);

    $response = $this->withSession(bffSessionPayload())
        ->from('/dashboard')
        ->post('/admin/users/invite', [
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'email' => 'jane@example.com',
            'organisation' => 'Acme Ltd',
        ]);

    $response->assertRedirect('/dashboard');
    $response->assertSessionHas('success', 'Invitation sent successfully.');

    Http::assertSent(function ($request) use ($apiUrl) {
        return $request->url() === $apiUrl
            && $request->hasHeader('Authorization', 'Bearer test-bff-token')
            && $request['first_name'] === 'Jane'
            && $request['last_name'] === 'Doe'
            && $request['email'] === 'jane@example.com'
            && $request['organisation'] === 'Acme Ltd';
    });
});

it('maps invite API validation errors to session errors', function () {
    $apiUrl = config('services.api.base_url').'/api/users/invite';

    Http::fake([
        $apiUrl => Http::response([
            'message' => 'The given data was invalid.',
            'errors' => [
                'email' => ['This email is already registered.'],
            ],
        ], 422),
    ]);

    $response = $this->withSession(bffSessionPayload())
        ->from('/dashboard')
        ->post('/admin/users/invite', [
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'email' => 'taken@example.com',
            'organisation' => 'Acme Ltd',
        ]);

    $response->assertInvalid(['email' => 'This email is already registered.']);
});

it('redirects to login when set-password link is missing query params', function () {
    $this->get('/set-password')
        ->assertRedirect('/login')
        ->assertSessionHas('error', 'Invalid or missing setup link');
});

it('shows set-password page when token and email are present', function () {
    $this->get('/set-password?token=abc&email=test%40example.com')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('auth/set-password'));
});

it('proxies set password and redirects to login on success', function () {
    $apiUrl = config('services.api.base_url').'/api/users/set-password';

    Http::fake([
        $apiUrl => Http::response(['message' => 'Password set'], 200),
    ]);

    $response = $this->post('/set-password', [
        'token' => 'valid-token',
        'email' => 'user@example.com',
        'password' => 'NewSecurePassword123!',
        'password_confirmation' => 'NewSecurePassword123!',
    ]);

    $response->assertRedirect('/login');
    $response->assertSessionHas(
        'success',
        'Your password has been set. You can log in now.',
    );
});

it('maps set-password API validation errors', function () {
    $apiUrl = config('services.api.base_url').'/api/users/set-password';

    Http::fake([
        $apiUrl => Http::response([
            'message' => 'The given data was invalid.',
            'errors' => [
                'token' => ['This password set token is invalid.'],
            ],
        ], 422),
    ]);

    $response = $this->post('/set-password', [
        'token' => 'bad',
        'email' => 'user@example.com',
        'password' => 'NewSecurePassword123!',
        'password_confirmation' => 'NewSecurePassword123!',
    ]);

    $response->assertInvalid(['token' => 'This password set token is invalid.']);
});

it('redirects to set-password with error flash on non-validation API failure', function () {
    $apiUrl = config('services.api.base_url').'/api/users/set-password';

    Http::fake([
        $apiUrl => Http::response([
            'message' => 'Token has expired.',
        ], 403),
    ]);

    $response = $this->post('/set-password', [
        'token' => 'expired',
        'email' => 'user@example.com',
        'password' => 'NewSecurePassword123!',
        'password_confirmation' => 'NewSecurePassword123!',
    ]);

    $response->assertRedirect(route('set-password.show', [
        'email' => 'user@example.com',
        'token' => 'expired',
    ]));
    $response->assertSessionHas('error', 'Token has expired.');
});
