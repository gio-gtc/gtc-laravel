<?php

use Illuminate\Support\Facades\Http;

require_once __DIR__.'/OrderItemFixtures.php';

it('proxies json staff index to gtc-api', function () {
    Http::fake([
        apiStaffUrl() => Http::response([
            'data' => [
                sampleStaffWireUser(12),
                sampleStaffWireUser(15),
            ],
        ], 200),
    ]);

    $this->actingAsBff()
        ->getJson(route('api.staff.index'))
        ->assertOk()
        ->assertJsonPath('staff.0.id', 12)
        ->assertJsonPath('staff.1.id', 15)
        ->assertJsonPath('staff.0.organisation_id', 1);

    Http::assertSent(function ($request) {
        return $request->url() === apiStaffUrl() && $request->method() === 'GET';
    });
});

it('forwards 403 from gtc-api for staff index', function () {
    Http::fake([
        apiStaffUrl() => Http::response([
            'message' => 'Forbidden.',
        ], 403),
    ]);

    $this->actingAsBff()
        ->getJson(route('api.staff.index'))
        ->assertForbidden()
        ->assertJsonPath('message', 'Forbidden.');
});
