<?php

use Illuminate\Support\Facades\Http;

// --- TEST 1: The Happy Path ---
it('proxies the reset password submission and redirects to login on success', function () {
    // dd('TEST URL:', config('services.api.base_url'));
    // Safely format the URL
    $apiUrl = config('services.api.base_url').'/api/reset-password';

    // 1. Fake the API successfully hashing the password and returning a 200 OK
    Http::fake([
        $apiUrl => Http::response([
            'status' => 'success',
            'message' => 'Your password has been reset.',
        ], 200),
    ]);

    // 2. Simulate the React form submitting the new password
    $response = $this->post('/reset-password', [
        'token' => 'fake-valid-token-123',
        'email' => 'test@example.com',
        'password' => 'NewSecurePassword123!',
        'password_confirmation' => 'NewSecurePassword123!',
    ]);

    // 3. Assert the BFF sends them to the login page with a green success banner
    $response->assertRedirect('/login');
    $response->assertSessionHas('status', 'Your password has been reset.');

    // 4. Next visit to login surfaces the message as page props (flash consumed once)
    $this->get(route('login'))
        ->assertOk()
        ->assertSee('Your password has been reset.', false);

    $this->get(route('login'))
        ->assertDontSee('Your password has been reset.');
});

// --- TEST 2: The Validation/Token Failure ---
it('catches API errors if the token is invalid or expired', function () {
    // dd('TEST URL:', config('services.api.base_url'));
    $apiUrl = config('services.api.base_url').'/api/reset-password';

    // 1. Fake the API rejecting the request (e.g., token expired or doesn't match the database)
    Http::fake([
        $apiUrl => Http::response([
            'message' => 'The given data was invalid.',
            'errors' => [
                'email' => ['This password reset token is invalid.'],
            ],
        ], 422),
    ]);

    // 2. Submit the form with a bad token
    $response = $this->post('/reset-password', [
        'token' => 'expired-or-invalid-token',
        'email' => 'test@example.com',
        'password' => 'NewSecurePassword123!',
        'password_confirmation' => 'NewSecurePassword123!',
    ]);

    // 3. Assert the BFF catches the 422 and throws the ValidationException for Inertia
    $response->assertInvalid(['email' => 'This password reset token is invalid.']);
});
