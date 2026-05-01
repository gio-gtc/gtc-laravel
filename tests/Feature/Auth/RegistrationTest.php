<?php

use Illuminate\Support\Facades\Http;

// --- TEST 1: Successful Registration ---
it('proxies registration data to the API and stores the new session token', function () {
    // 1. Fake the API successfully creating a user and returning a new token
    Http::fake([
        config('services.api.url') . '/api/register' => Http::response([
            'access_token' => 'new-user-token-456',
            'roles' => [],
            'permissions' => [],
            'user'         => ['id' => 2, 'name' => 'New User']
        ], 201)
    ]);

    // 2. Submit the registration form
    $response = $this->post('/register', [
        'name'                  => 'New User',
        'email'                 => 'new@example.com',
        'roles'                 => [],
        'password'              => 'securepassword',
        'password_confirmation' => 'securepassword',
    ]);

    // 3. Assert the BFF handled it correctly and logged them in
    $response->assertRedirect('/dashboard'); 
    $response->assertSessionHas('api_token', 'new-user-token-456'); 
});

// --- TEST 2: API Validation Errors ---
it('catches API registration validation errors and passes them to Inertia', function () {
    // 1. Fake the API rejecting the registration (e.g., email already exists)
    Http::fake([
        config('services.api.url') . '/api/register' => Http::response([
            'message' => 'The given data was invalid.',
            'errors'  => [
                'email' => ['The email has already been taken.']
            ]
        ], 422)
    ]);

    // 2. Submit the form
    $response = $this->post('/register', [
        'name'                  => 'New User',
        'email'                 => 'existing@example.com', // Triggers the fake API error
        'password'              => 'securepassword',
        'password_confirmation' => 'securepassword',
    ]);

    // 3. Assert the BFF catches the 422 and throws a Laravel validation exception for React
    $response->assertInvalid(['email' => 'The email has already been taken.']);
});