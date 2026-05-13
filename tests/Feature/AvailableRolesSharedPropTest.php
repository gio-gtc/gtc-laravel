<?php

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    Cache::flush();
});

function rolesUrl(): string
{
    return config('services.api.base_url').'/api/roles';
}

function rolesRequestCount(): int
{
    return Http::recorded()
        ->filter(
            fn (array $pair): bool => $pair[0]->url() === rolesUrl(),
        )
        ->count();
}

it('shares availableRoles on inertia pages for authed BFF users', function () {
    Http::fake([
        rolesUrl() => Http::response([
            'roles' => ['admin', 'manager', 'user'],
        ], 200),
    ]);

    $this->actingAsBff()
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('availableRoles', ['admin', 'manager', 'user']),
        );

    Http::assertSent(function ($request) {
        return $request->url() === rolesUrl()
            && $request->method() === 'GET'
            && $request->hasHeader('Authorization', 'Bearer test-bff-token');
    });
});

it('filters non-string entries from the upstream roles payload', function () {
    Http::fake([
        rolesUrl() => Http::response([
            'roles' => ['admin', 42, null, 'user', ['nested']],
        ], 200),
    ]);

    $this->actingAsBff()
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('availableRoles', ['admin', 'user']),
        );
});

it('shares an empty list when the upstream call fails', function () {
    Http::fake([
        rolesUrl() => Http::response(['message' => 'boom'], 503),
    ]);

    $this->actingAsBff()
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('availableRoles', []),
        );
});

it('shares an empty list when the upstream payload is malformed', function () {
    Http::fake([
        rolesUrl() => Http::response(['unexpected' => 'shape'], 200),
    ]);

    $this->actingAsBff()
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('availableRoles', []),
        );
});

it('caches the upstream roles list across requests', function () {
    Http::fake([
        rolesUrl() => Http::response([
            'roles' => ['admin', 'user'],
        ], 200),
    ]);

    $this->actingAsBff()->get(route('dashboard'))->assertOk();
    $this->actingAsBff()->get(route('dashboard'))->assertOk();

    expect(rolesRequestCount())->toBe(1);
});

it('shares an empty list and skips the API for guests', function () {
    Http::fake([
        rolesUrl() => Http::response(['roles' => ['admin']], 200),
    ]);

    $this->get(route('login'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('availableRoles', []),
        );

    expect(rolesRequestCount())->toBe(0);
});
