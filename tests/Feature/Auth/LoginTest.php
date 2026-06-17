<?php

use Illuminate\Support\Facades\Http;

it('surfaces flashed status and error on login and consumes them from session', function () {
    $response = $this->withSession([
        'status' => 'Your password has been reset.',
        'error' => 'This password reset link is invalid or has expired.',
    ])->get(route('login'));

    $response->assertOk();
    $response->assertSee('Your password has been reset.', false);
    $response->assertSee('This password reset link is invalid or has expired.', false);

    $response->assertSessionMissing('status');
    $response->assertSessionMissing('error');

    $this->get(route('login'))
        ->assertDontSee('Your password has been reset.')
        ->assertDontSee('This password reset link is invalid or has expired.');
});

// --- TEST 1: The Happy Path ---
it('proxies login credentials to the API and stores the session token', function () {
    // 1. Intercept any outgoing HTTP requests to your API and return a fake success response
    Http::fake([
        config('services.api.base_url').'/api/login' => Http::response([
            'access_token' => 'fake-sanctum-token-123',
            'user' => ['id' => 1, 'name' => 'Test User'],
            'roles' => ['Super Admin'],
            'permissions' => [],
        ], 200),
    ]);

    // 2. Simulate the React/Inertia frontend submitting the login form to the BFF
    $response = $this->post('/login', [
        'email' => 'test@example.com',
        'password' => 'password',
    ]);

    // 3. Assert the BFF handled it correctly
    $response->assertRedirect('/dashboard');

    // Assert the BFF saved the token to the local session (adjust 'api_token' to match your actual session key)
    $response->assertSessionHas('api_token', 'fake-sanctum-token-123');
});

it('redirects Clients to the orders index after login', function () {
    Http::fake([
        config('services.api.base_url').'/api/login' => Http::response([
            'access_token' => 'fake-sanctum-token-123',
            'user' => ['id' => 2, 'name' => 'Client User'],
            'roles' => ['Client'],
            'permissions' => [],
        ], 200),
    ]);

    $response = $this->post('/login', [
        'email' => 'client@example.com',
        'password' => 'password',
    ]);

    $response->assertRedirect(route('orders', absolute: false));
});

it('redirects users without a privileged role to the my-tasks order filter', function () {
    Http::fake([
        config('services.api.base_url').'/api/login' => Http::response([
            'access_token' => 'fake-sanctum-token-123',
            'user' => ['id' => 3, 'name' => 'Staff User'],
            'roles' => ['Operator'],
            'permissions' => [],
        ], 200),
    ]);

    $response = $this->post('/login', [
        'email' => 'staff@example.com',
        'password' => 'password',
    ]);

    $response->assertRedirect(route('orders', ['filter' => 'my-tasks'], absolute: false));
});

// --- TEST 2: The Validation Failure ---
it('catches API validation errors and passes them back to Inertia', function () {
    // 1. Fake the API rejecting the login with a 422 Unprocessable Entity
    Http::fake([
        config('services.api.base_url').'/api/login' => Http::response([
            'message' => 'The given data was invalid.',
            'errors' => [
                'email' => ['These credentials do not match our records.'],
            ],
        ], 422),
    ]);

    // 2. Submit the form
    $response = $this->post('/login', [
        'email' => 'wrong@example.com',
        'password' => 'wrongpassword',
    ]);

    // 3. Assert the BFF intercepted the 422 and threw a standard Laravel ValidationException,
    // which Inertia automatically converts into frontend form errors.
    $response->assertInvalid(['email' => 'These credentials do not match our records.']);
});
