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
            'roles' => [],
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

// --- TEST 3: The Logout Success ---
it('proxies logout to the API and clears the local session', function () {
    // 1. Intercept the BFF's outgoing request to the API's logout endpoint
    Http::fake([
        config('services.api.base_url').'/api/logout' => Http::response(['message' => 'Logged out'], 200),
    ]);

    // 2. Simulate a user who is currently logged in (they have a token in their session)
    $response = $this->withSession(['access_token' => 'real-sanctum-token-123'])
        ->post('/logout');

    // 3. Assert they are kicked back to the login page
    $response->assertRedirect('/login');

    // 4. THE CRITICAL SECURITY CHECK: Assert the token was completely scrubbed from the session
    $response->assertSessionMissing('access_token');
});
