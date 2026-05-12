<?php

use Illuminate\Support\Facades\Http;

it('proxies profile update to the API and redirects back on success', function () {
    $apiUrl = config('services.api.base_url').'/api/profile';

    Http::fake([
        $apiUrl => Http::response([
            'message' => 'Profile updated.',
            'user' => [
                'id' => 1,
                'email' => 'jane@example.com',
                'pending_email' => null,
            ],
        ], 200),
    ]);

    $response = $this->actingAsBff()
        ->from('/settings/profile')
        ->put('/settings/profile', [
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'email' => 'jane@example.com',
            'phone_number' => '+15551234567',
            'job_title' => 'Engineer',
            'organisation_id' => 42,
            'department' => 'Engineering',
        ]);

    $response->assertRedirect('/settings/profile');
    $response->assertSessionHas('success', 'Profile updated.');

    Http::assertSent(function ($request) use ($apiUrl) {
        return $request->method() === 'PUT'
            && $request->url() === $apiUrl
            && $request->hasHeader('Authorization', 'Bearer test-bff-token')
            && $request['first_name'] === 'Jane'
            && $request['last_name'] === 'Doe'
            && $request['email'] === 'jane@example.com'
            && $request['phone_number'] === '+15551234567'
            && $request['job_title'] === 'Engineer'
            && $request['organisation_id'] === 42
            && $request['department'] === 'Engineering';
    });
});

it('flashes the API pending-email message and stores pending_email when the email changes', function () {
    $apiUrl = config('services.api.base_url').'/api/profile';
    $pendingMessage = 'Profile updated. Please check your new inbox to verify your updated email address.';

    Http::fake([
        $apiUrl => Http::response([
            'message' => $pendingMessage,
            'user' => [
                'id' => 1,
                'email' => 'jane@example.com',
                'pending_email' => 'jane+new@example.com',
            ],
        ], 200),
    ]);

    $response = $this->actingAsBff()
        ->from('/settings/profile')
        ->put('/settings/profile', [
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'email' => 'jane+new@example.com',
            'phone_number' => '+15551234567',
            'job_title' => 'Engineer',
            'organisation_id' => 42,
            'department' => 'Engineering',
        ]);

    $response->assertRedirect('/settings/profile');
    $response->assertSessionHas('success', $pendingMessage);

    $sessionUser = session('user');
    expect($sessionUser)->toBeArray();
    expect($sessionUser['pending_email'])->toBe('jane+new@example.com');
});

it('redirects to the dashboard with a success flash when email_verified=true', function () {
    $response = $this->actingAsBff()
        ->get('/settings/profile?email_verified=true');

    $response->assertRedirect(route('dashboard'));
    $response->assertSessionHas('success', 'Your email has been successfully updated!');
});

it('maps API 422 validation errors back to the form', function () {
    $apiUrl = config('services.api.base_url').'/api/profile';

    Http::fake([
        $apiUrl => Http::response([
            'message' => 'The given data was invalid.',
            'errors' => ['email' => ['Email already in use.']],
        ], 422),
    ]);

    $this->actingAsBff()
        ->from('/settings/profile')
        ->put('/settings/profile', [
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'email' => 'taken@example.com',
            'phone_number' => '+15551234567',
        ])
        ->assertInvalid(['email' => 'Email already in use.']);
});

it('rejects an empty phone_number with 422', function () {
    $this->actingAsBff()
        ->from('/settings/profile')
        ->put('/settings/profile', [
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'email' => 'jane@example.com',
            'phone_number' => '',
        ])
        ->assertInvalid(['phone_number']);

    Http::assertNothingSent();
});

it('rejects a phone_number that is not E.164', function () {
    $this->actingAsBff()
        ->from('/settings/profile')
        ->put('/settings/profile', [
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'email' => 'jane@example.com',
            'phone_number' => '555',
        ])
        ->assertInvalid(['phone_number']);

    Http::assertNothingSent();
});

it('redirects unauthenticated requests to login', function () {
    $this->put('/settings/profile', [
        'first_name' => 'Jane',
        'last_name' => 'Doe',
        'email' => 'jane@example.com',
    ])->assertRedirect('/login');
});
