<?php

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    Cache::flush();
});

function referenceDataApiUrl(): string
{
    return rtrim((string) config('services.api.base_url'), '/').'/api/reference-data';
}

function rolesApiUrl(): string
{
    return rtrim((string) config('services.api.base_url'), '/').'/api/roles';
}

function referenceDataRecordedCount(): int
{
    return Http::recorded()
        ->filter(fn (array $pair): bool => $pair[0]->url() === referenceDataApiUrl())
        ->count();
}

it('shares ApiReferenceData.roles on inertia pages when reference-data includes roles', function () {
    Http::fake([
        referenceDataApiUrl() => Http::response([
            'org_types' => [],
            'countries' => [],
            'currency_codes' => [],
            'roles' => ['admin', 'manager', 'user'],
        ], 200),
    ]);

    $this->actingAsBff()
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('ApiReferenceData.roles', ['admin', 'manager', 'user']));

    Http::assertSent(function ($request) {
        return $request->url() === referenceDataApiUrl()
            && $request->method() === 'GET'
            && $request->hasHeader('Authorization', 'Bearer test-bff-token');
    });

    Http::assertNotSent(fn ($request) => $request->url() === rolesApiUrl());
});

it('fills roles via GET roles when reference-data omits role names', function () {
    Http::fake([
        referenceDataApiUrl() => Http::response([
            'org_types' => [],
            'countries' => [],
            'currency_codes' => [],
        ], 200),
        rolesApiUrl() => Http::response([
            'roles' => ['admin', 'user'],
        ], 200),
    ]);

    $this->actingAsBff()
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('ApiReferenceData.roles', ['admin', 'user']));

    Http::assertSent(fn ($request) => $request->url() === rolesApiUrl());
});

it('filters non-string entries from upstream roles payloads', function () {
    Http::fake([
        referenceDataApiUrl() => Http::response([
            'org_types' => [],
            'countries' => [],
            'currency_codes' => [],
            'roles' => ['admin', 42, null, 'user', ['nested']],
        ], 200),
    ]);

    $this->actingAsBff()
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('ApiReferenceData.roles', ['admin', 'user']));
});

it('shares fallback reference data when the upstream reference-data call fails', function () {
    Http::fake([
        referenceDataApiUrl() => Http::response(['message' => 'boom'], 503),
    ]);

    $this->actingAsBff()
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('ApiReferenceData')
            ->where('ApiReferenceData.org_types', [])
            ->where('ApiReferenceData.countries', [])
            ->where('ApiReferenceData.currency_codes', [])
            ->where('ApiReferenceData.roles', []));
});

it('shares fallback when upstream reference-data payload is not an object', function () {
    Http::fake([
        referenceDataApiUrl() => Http::response('"string"', 200, ['Content-Type' => 'application/json']),
    ]);

    $this->actingAsBff()
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('ApiReferenceData.roles', [])
            ->where('ApiReferenceData.org_types', []));
});

it('caches reference-data across inertia requests using a token-scoped key', function () {
    Http::fake([
        referenceDataApiUrl() => Http::response([
            'org_types' => [],
            'countries' => [],
            'currency_codes' => [],
            'roles' => ['admin', 'user'],
        ], 200),
    ]);

    $this->actingAsBff()->get(route('dashboard'))->assertOk();
    $this->actingAsBff()->get(route('dashboard'))->assertOk();

    expect(referenceDataRecordedCount())->toBe(1);
});

it('shares fallback reference data for guests without calling the upstream API', function () {
    Http::fake([
        referenceDataApiUrl() => Http::response([
            'roles' => ['admin'],
        ], 200),
    ]);

    $this->get(route('login'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('ApiReferenceData')
            ->where('ApiReferenceData.roles', [])
            ->where('ApiReferenceData.org_types', []));

    expect(referenceDataRecordedCount())->toBe(0);
});
