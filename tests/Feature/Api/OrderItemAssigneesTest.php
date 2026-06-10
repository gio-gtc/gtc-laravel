<?php

use Illuminate\Support\Facades\Http;

require_once __DIR__.'/OrderItemFixtures.php';

it('proxies json sync order item assignees to gtc-api', function () {
    Http::fake([
        apiOrderItemAssigneesUrl(200) => Http::response([
            'message' => 'Line item assignees synced successfully.',
            'data' => [
                sampleStaffWireUser(12),
                sampleStaffWireUser(15),
            ],
        ], 200),
    ]);

    $this->actingAsBff()
        ->postJson(route('api.order-items.assignees.sync', ['orderItem' => 200]), [
            'user_ids' => [12, 15],
        ])
        ->assertOk()
        ->assertJsonPath('assignees.0.id', 12)
        ->assertJsonPath('assignees.1.id', 15)
        ->assertJsonPath('message', 'Line item assignees synced successfully.');

    Http::assertSent(function ($request) {
        if ($request->url() !== apiOrderItemAssigneesUrl(200) || $request->method() !== 'POST') {
            return false;
        }

        return $request->data()['user_ids'] === [12, 15];
    });
});

it('proxies empty user_ids to clear assignees', function () {
    Http::fake([
        apiOrderItemAssigneesUrl(200) => Http::response([
            'message' => 'Line item assignees synced successfully.',
            'data' => [],
        ], 200),
    ]);

    $this->actingAsBff()
        ->postJson(route('api.order-items.assignees.sync', ['orderItem' => 200]), [
            'user_ids' => [],
        ])
        ->assertOk()
        ->assertJsonPath('assignees', []);

    Http::assertSent(function ($request) {
        return $request->data()['user_ids'] === [];
    });
});

it('proxies json index order item assignees to gtc-api', function () {
    Http::fake([
        apiOrderItemAssigneesUrl(200) => Http::response([
            'data' => [sampleStaffWireUser(12)],
        ], 200),
    ]);

    $this->actingAsBff()
        ->getJson(route('api.order-items.assignees.index', ['orderItem' => 200]))
        ->assertOk()
        ->assertJsonPath('assignees.0.id', 12);

    Http::assertSent(function ($request) {
        return $request->url() === apiOrderItemAssigneesUrl(200) && $request->method() === 'GET';
    });
});

it('proxies json destroy order item assignee to gtc-api', function () {
    Http::fake([
        apiOrderItemAssigneeDestroyUrl(200, 12) => Http::response([
            'message' => 'Assignee detached from line item successfully.',
            'data' => [sampleStaffWireUser(15)],
        ], 200),
    ]);

    $this->actingAsBff()
        ->deleteJson(route('api.order-items.assignees.destroy', ['orderItem' => 200, 'user' => 12]))
        ->assertOk()
        ->assertJsonPath('assignees.0.id', 15);

    Http::assertSent(function ($request) {
        return $request->url() === apiOrderItemAssigneeDestroyUrl(200, 12)
            && $request->method() === 'DELETE';
    });
});

it('forwards 422 validation errors from gtc-api for assignee sync', function () {
    Http::fake([
        apiOrderItemAssigneesUrl(200) => Http::response([
            'message' => 'The given data was invalid.',
            'errors' => [
                'user_ids.0' => ['The selected user_ids.0 is invalid.'],
            ],
        ], 422),
    ]);

    $this->actingAsBff()
        ->postJson(route('api.order-items.assignees.sync', ['orderItem' => 200]), [
            'user_ids' => [999],
        ])
        ->assertUnprocessable()
        ->assertJsonFragment([
            'user_ids.0' => ['The selected user_ids.0 is invalid.'],
        ]);
});

it('forwards 403 from gtc-api for assignee sync', function () {
    Http::fake([
        apiOrderItemAssigneesUrl(200) => Http::response([
            'message' => 'Forbidden.',
        ], 403),
    ]);

    $this->actingAsBff()
        ->postJson(route('api.order-items.assignees.sync', ['orderItem' => 200]), [
            'user_ids' => [12],
        ])
        ->assertForbidden()
        ->assertJsonPath('message', 'Forbidden.');
});
