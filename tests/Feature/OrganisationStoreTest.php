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
