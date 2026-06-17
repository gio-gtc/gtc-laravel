<?php

it('redirects unauthenticated users back to login', function () {
    // 1. Attempt to visit a protected route WITHOUT an api_token in the session
    $response = $this->get('/dashboard');

    // 2. Assert your custom middleware caught them and redirected to the login page
    $response->assertRedirect('/login');
});

it('allows authenticated users to view protected routes', function () {
    // 1. Manually inject a fake token into the testing session
    $response = $this->withSession(['api_token' => 'valid-token-123'])
        ->get('/dashboard');

    // 2. Assert the middleware let them through (usually results in a 200 OK for the Inertia page)
    $response->assertStatus(200);
});