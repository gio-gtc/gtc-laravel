<?php

use Illuminate\Support\Facades\Http;

function organisationsPostUrl(): string
{
    return rtrim((string) config('services.api.base_url'), '/').'/api/organisations';
}

it('proxies organisation create to gtc-api and flashes success', function () {
    Http::fake([
        organisationsPostUrl() => Http::response(['id' => 42, 'name' => 'Acme'], 200),
    ]);

    $payload = ['name' => 'Acme Corp'];

    $response = $this->actingAsBff()
        ->from(route('dashboard'))
        ->post('/organisations', $payload);

    $response->assertRedirect(route('dashboard', absolute: false));
    $response->assertSessionHas('success');

    Http::assertSent(function ($request) use ($payload) {
        return $request->url() === organisationsPostUrl()
            && $request->method() === 'POST'
            && $request->hasHeader('Authorization', 'Bearer test-bff-token')
            && $request->data() === $payload;
    });
});

it('maps upstream 422 errors into Laravel validation messages', function () {
    Http::fake([
        organisationsPostUrl() => Http::response([
            'message' => 'The given data was invalid.',
            'errors' => [
                'name' => ['The organisation name is already taken.'],
            ],
        ], 422),
    ]);

    $this->actingAsBff()
        ->from(route('dashboard'))
        ->post('/organisations', ['name' => 'Taken'])
        ->assertInvalid([
            'name' => 'The organisation name is already taken.',
        ]);
});

it('redirects guests to login when creating an organisation', function () {
    $this->from(route('login'))
        ->post('/organisations', ['name' => 'Acme'])
        ->assertRedirect(route('login'));

    Http::assertNothingSent();
});

it('flashes upstream JSON message when organisation create fails', function () {
    Http::fake([
        organisationsPostUrl() => Http::response([
            'message' => 'Organisations are temporarily read-only.',
        ], 503),
    ]);

    $this->actingAsBff()
        ->from(route('dashboard'))
        ->post('/organisations', ['name' => 'Acme'])
        ->assertRedirect(route('dashboard', absolute: false))
        ->assertSessionHas('error', 'Organisations are temporarily read-only.');
});

it('flashes a generic error when organisation create fails without a message', function () {
    Http::fake([
        organisationsPostUrl() => Http::response(null, 500),
    ]);

    $this->actingAsBff()
        ->from(route('dashboard'))
        ->post('/organisations', ['name' => 'Acme'])
        ->assertRedirect(route('dashboard', absolute: false))
        ->assertSessionHas(
            'error',
            'Could not create the organisation right now. Please try again.',
        );
});

it('maps upstream 422 with empty errors to a generic validation message', function () {
    Http::fake([
        organisationsPostUrl() => Http::response([
            'message' => 'The given data was invalid.',
            'errors' => [],
        ], 422),
    ]);

    $this->actingAsBff()
        ->from(route('dashboard'))
        ->post('/organisations', ['name' => 'Acme'])
        ->assertInvalid(['name' => 'The given data was invalid.']);
});

it('normalizes single-string API validation errors into message bags', function () {
    Http::fake([
        organisationsPostUrl() => Http::response([
            'message' => 'The given data was invalid.',
            'errors' => [
                'billing_address' => 'Street is required.',
            ],
        ], 422),
    ]);

    $this->actingAsBff()
        ->from(route('dashboard'))
        ->post('/organisations', ['name' => 'Acme'])
        ->assertInvalid(['billing_address' => 'Street is required.']);
});
