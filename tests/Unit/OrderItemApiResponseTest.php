<?php

use App\Support\OrderItemApiResponse;

it('extracts parent_order_update when present', function () {
    $patch = [
        'id' => 1042,
        'statuses' => [['id' => 2, 'name' => 'In Progress']],
        'tags' => ['Art'],
        'updated_at' => '2026-06-11T11:17:10.000000Z',
    ];

    expect(OrderItemApiResponse::extractParentOrderUpdate([
        'parent_order_update' => $patch,
    ]))->toBe($patch);
});

it('returns null when parent_order_update is missing or invalid', function () {
    expect(OrderItemApiResponse::extractParentOrderUpdate([]))->toBeNull();
    expect(OrderItemApiResponse::extractParentOrderUpdate([
        'parent_order_update' => ['statuses' => []],
    ]))->toBeNull();
});

it('extracts virtual_billing_lines when present', function () {
    $lines = [
        ['type' => 'Encoding', 'description' => 'Encoding', 'total' => 250],
    ];

    expect(OrderItemApiResponse::extractVirtualBillingLines([
        'virtual_billing_lines' => $lines,
    ]))->toBe($lines);

    expect(OrderItemApiResponse::extractVirtualBillingLines([]))->toBe([]);
});
