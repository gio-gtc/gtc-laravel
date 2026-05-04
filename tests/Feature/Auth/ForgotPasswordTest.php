<?php

use Illuminate\Support\Facades\Http;

// --- TEST 1: The Happy Path ---
it('proxies the forgot password request and flashes a success status to the session', function () {
    // 1. Fake the API successfully generating the token and queuing the email
    Http::fake([
        config('services.api.base_url') . '/api/forgot-password'  => Http::response([
            'status'  => 'success',
            'message' => 'We have emailed your password reset link.'
        ], 200)
    ]);

    // 2. Simulate the React form submitting the user's email
    $response = $this->post('/forgot-password', [
        'email' => 'test@example.com',
    ]);

    // 3. Assert the BFF redirects back and passes the green success message to Inertia
    $response->assertRedirect();
    $response->assertSessionHas('status', 'We have emailed your password reset link.');
});


// --- TEST 2: The Validation Failure ---
it('catches API validation errors if the email is not found in the AWS database', function () {
    // 1. Fake the API rejecting the request because the email doesn't exist
    Http::fake([
        config('services.api.base_url') . '/api/forgot-password' => Http::response([
            'message' => 'The given data was invalid.',
            'errors'  => [
                'email' => ['We can not find a user with that email address.']
            ]
        ], 422)
    ]);

    // 2. Submit the form with an unregistered email
    $response = $this->post('/forgot-password', [
        'email' => 'test@test.com',
    ]);

    // 3. Assert the BFF intercepts the 422 and throws a Laravel ValidationException,
    // which Inertia automatically binds to the `errors.email` object in React.
    $response->assertInvalid(['email' => 'We can not find a user with that email address.']);
});