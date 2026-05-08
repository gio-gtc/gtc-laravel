<?php

use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    // Attempt to view the dashboard without using actingAsBff()
    $this->get(route('dashboard'))
        ->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard and see the react component', function () {
    // Log in as a fake user, then view the dashboard
    $this->actingAsBff()
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
        );
});