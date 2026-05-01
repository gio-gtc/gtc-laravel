<?php

use Illuminate\Support\Facades\Http;

test('login screen can be rendered', function () {
    $response = $this->get(route('login'));

    $response->assertStatus(200);
});

test('users can authenticate using the login screen', function () {
    $base = rtrim(env('API_BASE_URL', 'http://127.0.0.1:8000'), '/');

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
    $base = rtrim(env('API_BASE_URL', 'http://127.0.0.1:8000'), '/');

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
