<?php

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    Cache::flush();
});

function toursApiBaseUrl(): string
{
    return rtrim((string) config('services.api.base_url'), '/');
}

function toursUsersApiUrl(): string
{
    return toursApiBaseUrl().'/api/users';
}

function toursDepartmentsApiUrl(): string
{
    return toursApiBaseUrl().'/api/departments';
}

function toursStoreApiUrl(): string
{
    return toursApiBaseUrl().'/api/tours';
}

it('shares filtered tour form props from users and departments APIs', function () {
    Http::fake([
        toursUsersApiUrl() => Http::response([
            'users' => [
                [
                    'id' => 10,
                    'first_name' => 'GTC',
                    'last_name' => 'Rep',
                    'organisation_id' => 1,
                    'organisation' => ['types' => [['id' => 1, 'name' => 'Promoter']]],
                ],
                [
                    'id' => 20,
                    'first_name' => 'Other',
                    'last_name' => 'User',
                    'organisation_id' => 2,
                    'organisation' => ['types' => [['id' => 5, 'name' => 'Venue']]],
                ],
                [
                    'id' => 30,
                    'first_name' => 'Voice',
                    'last_name' => 'Over',
                    'organisation_id' => 4,
                    'organisation' => ['types' => [['id' => 3, 'name' => 'Voice Over']]],
                ],
            ],
        ], 200),
        toursDepartmentsApiUrl() => Http::response([
            'departments' => [
                ['id' => 10, 'name' => 'Design'],
            ],
        ], 200),
    ]);

    $this->actingAsBff()
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('departments', 1)
            ->where('departments.0.name', 'Design')
            ->has('gtcReps', 1)
            ->where('gtcReps.0.id', 10)
            ->has('voiceOvers', 1)
            ->where('voiceOvers.0.id', 30));

    Http::assertSent(function ($request) {
        return $request->url() === toursUsersApiUrl()
            && $request->method() === 'GET'
            && $request->hasHeader('Authorization', 'Bearer test-bff-token');
    });

    Http::assertSent(function ($request) {
        return $request->url() === toursDepartmentsApiUrl()
            && $request->method() === 'GET'
            && $request->hasHeader('Authorization', 'Bearer test-bff-token');
    });
});

it('proxies tour create to the API with mapped field names', function () {
    Http::fake([
        toursStoreApiUrl() => Http::response(['id' => 99], 201),
    ]);

    $response = $this->actingAsBff()
        ->from(route('dashboard'))
        ->post(route('tours.store'), [
            'name' => 'Summer Tour',
            'start_date' => '2026-06-01',
            'gtc_department' => '2',
            'gtc_representative' => '10',
            'voice_over' => '30',
        ]);

    $response->assertRedirect(route('dashboard', absolute: false));
    $response->assertSessionHas('success', 'Tour created successfully.');

    Http::assertSent(function ($request) {
        return $request->url() === toursStoreApiUrl()
            && $request->hasHeader('Authorization', 'Bearer test-bff-token')
            && $request['name'] === 'Summer Tour'
            && $request['gtc_rep_id'] === '10'
            && $request['department_id'] === '2'
            && $request['voice_over_id'] === '30';
    });
});

it('proxies tour create with null voice_over_id when voice over is unset', function () {
    Http::fake([
        toursStoreApiUrl() => Http::response(['id' => 100], 201),
    ]);

    $response = $this->actingAsBff()
        ->from(route('dashboard'))
        ->post(route('tours.store'), [
            'name' => 'No Voice Tour',
            'start_date' => '2026-06-01',
            'gtc_department' => '2',
            'gtc_representative' => '10',
            'voice_over' => null,
        ]);

    $response->assertRedirect(route('dashboard', absolute: false));
    $response->assertSessionHas('success', 'Tour created successfully.');

    Http::assertSent(function ($request) {
        return $request->url() === toursStoreApiUrl()
            && $request->hasHeader('Authorization', 'Bearer test-bff-token')
            && $request['name'] === 'No Voice Tour'
            && array_key_exists('voice_over_id', $request->data())
            && $request['voice_over_id'] === null;
    });
});

it('maps upstream 422 errors into Laravel validation messages', function () {
    Http::fake([
        toursStoreApiUrl() => Http::response([
            'message' => 'The given data was invalid.',
            'errors' => [
                'name' => ['The tour name is required.'],
            ],
        ], 422),
    ]);

    $this->actingAsBff()
        ->from(route('dashboard'))
        ->post(route('tours.store'), ['name' => ''])
        ->assertInvalid([
            'name' => 'The tour name is required.',
        ]);
});

it('redirects to login when not authenticated with BFF token', function () {
    $this->post(route('tours.store'), [
        'name' => 'Guest Tour',
    ])->assertRedirect('/login');

    Http::assertNothingSent();
});
