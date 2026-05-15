<?php

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    Cache::flush();
});

function organisationModalReferenceDataUrl(): string
{
    return rtrim((string) config('services.api.base_url'), '/').'/api/reference-data';
}

it('shares org_types, countries, and ordered currency_codes for the organisation modal', function () {
    Http::fake([
        organisationModalReferenceDataUrl() => Http::response([
            'org_types' => [
                ['id' => 5, 'name' => 'Distributor'],
            ],
            'countries' => [
                ['id' => 99, 'name' => 'Australia'],
            ],
            'currency_codes' => ['AUD', 'USD', 'EUR'],
            'roles' => ['admin'],
        ], 200),
    ]);

    $this->actingAsBff()
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('ApiReferenceData.org_types', [
                ['id' => 5, 'name' => 'Distributor'],
            ])
            ->where('ApiReferenceData.countries', [
                ['id' => 99, 'name' => 'Australia'],
            ])
            ->where('ApiReferenceData.currency_codes', ['USD', 'AUD', 'EUR']));
});
