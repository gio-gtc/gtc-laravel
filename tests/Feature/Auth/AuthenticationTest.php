<?php

use Illuminate\Support\Facades\Http;

test('authenticated BFF sessions are redirected from login to dashboard', function () {
    $response = $this->withSession([
        'api_token' => 'existing-token',
        'user' => ['id' => 1, 'email' => 'a@b.test'],
        'roles' => [],
        'permissions' => [],
    ])->get(route('login'));

    $response->assertRedirect(route('dashboard', absolute: false));
});

test('login screen can be rendered', function () {
    $response = $this->get(route('login'));

    $response->assertStatus(200);
});

test('users can authenticate using the login screen', function () {
    $base = config('services.api.base_url');

    Http::fake([
        $base.'/api/login' => Http::response([
            'access_token' => 'test-access-token',
            'user' => [
                'id' => 1,
                'name' => 'Test User',
                'email' => 'test@example.com',
            ],
            'roles' => [],
            'permissions' => [],
        ], 200),
    ]);

    $response = $this->post(route('login.store'), [
        'email' => 'test@example.com',
        'password' => 'password',
    ]);

    $response->assertRedirect(route('dashboard', absolute: false));

    $this->assertSame('test-access-token', session('api_token'));
    $this->assertIsArray(session('user'));
    $this->assertSame('test@example.com', session('user')['email']);
});

test('users can not authenticate with invalid password', function () {
    $base = config('services.api.base_url');

    Http::fake([
        $base.'/api/login' => Http::response(['message' => 'Unauthenticated.'], 401),
    ]);

    $this->post(route('login.store'), [
        'email' => 'test@example.com',
        'password' => 'wrong-password',
    ]);

    $this->assertNull(session('api_token'));
});

test('users can logout', function () {
    $response = $this->withSession([
        'api_token' => 'x',
        'user' => ['id' => 1, 'email' => 'a@b.test'],
        'roles' => [],
        'permissions' => [],
    ])->post(route('logout'));

    $response->assertRedirect(route('login'));
    $this->assertNull(session('api_token'));
    $this->assertNull(session('user'));
});
