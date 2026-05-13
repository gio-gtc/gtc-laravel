<?php

use Illuminate\Support\Facades\Http;

function bffSessionForContactInvite(): array
{
    return [
        'api_token' => 'test-bff-token',
        'user' => [
            'id' => 1,
            'name' => 'Admin',
            'email' => 'admin@example.com',
        ],
        'roles' => [],
        'permissions' => [],
    ];
}

it('proxies contact invite to the API and redirects back on success', function () {
    $path = ltrim(config('services.api.contacts_invite_path', 'api/contacts/invite'), '/');
    $apiUrl = config('services.api.base_url').'/'.$path;

    Http::fake([
        $apiUrl => Http::response(['message' => 'Queued'], 200),
    ]);

    $response = $this->withSession(bffSessionForContactInvite())
        ->from('/dashboard')
        ->post('/contacts/invite', [
            'first_name' => 'Pat',
            'last_name' => 'Lee',
            'email' => 'pat@example.com',
            'organisation' => 'Org Ltd',
            'job_title' => 'PM',
            'department' => 'Ops',
            'phone_number' => '+15551234567',
            'about_me' => 'Hi',
            'role' => 'Admin',
        ]);

    $response->assertRedirect('/dashboard');
    $response->assertSessionHas('success', 'Contact invitation email sent.');

    Http::assertSent(function ($request) use ($apiUrl) {
        return $request->url() === $apiUrl
            && $request->hasHeader('Authorization', 'Bearer test-bff-token')
            && $request['email'] === 'pat@example.com';
    });
});

it('maps contact already exists from API validation', function () {
    $path = ltrim(config('services.api.contacts_invite_path', 'api/contacts/invite'), '/');
    $apiUrl = config('services.api.base_url').'/'.$path;

    Http::fake([
        $apiUrl => Http::response([
            'message' => 'User exists.',
            'errors' => [
                'email' => ['A user with this email already exists.'],
            ],
        ], 422),
    ]);

    $response = $this->withSession(bffSessionForContactInvite())
        ->from('/dashboard')
        ->post('/contacts/invite', [
            'first_name' => 'Pat',
            'last_name' => 'Lee',
            'email' => 'dupe@example.com',
            'organisation' => 'Org Ltd',
            'phone_number' => '+15551234567',
        ]);

    $response->assertInvalid([
        'email' => 'A user with this email already exists.',
    ]);
});

it('rejects an empty phone_number with 422', function () {
    $this->withSession(bffSessionForContactInvite())
        ->from('/dashboard')
        ->post('/contacts/invite', [
            'first_name' => 'Pat',
            'last_name' => 'Lee',
            'email' => 'pat@example.com',
            'organisation' => 'Org Ltd',
            'phone_number' => '',
        ])
        ->assertInvalid(['phone_number']);

    Http::assertNothingSent();
});

it('rejects a phone_number that is not E.164', function () {
    $this->withSession(bffSessionForContactInvite())
        ->from('/dashboard')
        ->post('/contacts/invite', [
            'first_name' => 'Pat',
            'last_name' => 'Lee',
            'email' => 'pat@example.com',
            'organisation' => 'Org Ltd',
            'phone_number' => '555',
        ])
        ->assertInvalid(['phone_number']);

    Http::assertNothingSent();
});

it('redirects to login when not authenticated with BFF token', function () {
    $this->post('/contacts/invite', [
        'first_name' => 'A',
        'last_name' => 'B',
        'email' => 'a@b.test',
        'organisation' => 'C',
    ])->assertRedirect('/login');
});
