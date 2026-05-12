<?php

use Illuminate\Support\Facades\Http;

it('proxies password update to the API and redirects back on success', function () {
    $apiUrl = config('services.api.base_url').'/api/password';

    Http::fake([
        $apiUrl => Http::response([
            'message' => 'Password updated successfully.',
        ], 200),
    ]);

    $response = $this->actingAsBff()
        ->from('/settings/profile')
        ->put('/settings/password', [
            'current_password' => 'old-password',
            'password' => 'new-password-1!',
            'password_confirmation' => 'new-password-1!',
        ]);

    $response->assertRedirect('/settings/profile');
    $response->assertSessionHas('success', 'Password updated successfully.');

    Http::assertSent(function ($request) use ($apiUrl) {
        return $request->method() === 'PUT'
            && $request->url() === $apiUrl
            && $request->hasHeader('Authorization', 'Bearer test-bff-token')
            && $request['current_password'] === 'old-password'
            && $request['password'] === 'new-password-1!'
            && $request['password_confirmation'] === 'new-password-1!';
    });
});

it('maps API 422 validation errors back to the form', function () {
    $apiUrl = config('services.api.base_url').'/api/password';

    Http::fake([
        $apiUrl => Http::response([
            'message' => 'The given data was invalid.',
            'errors' => [
                'current_password' => [
                    'The provided password does not match your current password.',
                ],
            ],
        ], 422),
    ]);

    $this->actingAsBff()
        ->from('/settings/profile')
        ->put('/settings/password', [
            'current_password' => 'wrong-password',
            'password' => 'new-password-1!',
            'password_confirmation' => 'new-password-1!',
        ])
        ->assertInvalid([
            'current_password' => 'The provided password does not match your current password.',
        ]);
});

it('rejects mismatched password confirmation locally without hitting the API', function () {
    $this->actingAsBff()
        ->from('/settings/profile')
        ->put('/settings/password', [
            'current_password' => 'old-password',
            'password' => 'new-password-1!',
            'password_confirmation' => 'something-else',
        ])
        ->assertInvalid(['password']);

    Http::assertNothingSent();
});

it('rejects a too-short new password locally without hitting the API', function () {
    $this->actingAsBff()
        ->from('/settings/profile')
        ->put('/settings/password', [
            'current_password' => 'old-password',
            'password' => 'short',
            'password_confirmation' => 'short',
        ])
        ->assertInvalid(['password']);

    Http::assertNothingSent();
});

it('redirects unauthenticated requests to login', function () {
    $this->put('/settings/password', [
        'current_password' => 'old-password',
        'password' => 'new-password-1!',
        'password_confirmation' => 'new-password-1!',
    ])->assertRedirect('/login');
});
