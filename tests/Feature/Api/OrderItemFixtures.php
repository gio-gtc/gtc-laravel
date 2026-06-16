<?php

function gtcApiBaseUrl(): string
{
    return rtrim((string) config('services.api.base_url'), '/');
}

function apiOrderItemsStoreUrl(int $orderId): string
{
    return gtcApiBaseUrl()."/api/orders/{$orderId}/items";
}

function apiOrderItemUrl(int $orderItemId): string
{
    return gtcApiBaseUrl()."/api/order-items/{$orderItemId}";
}

function apiOrderItemsBulkUpdateUrl(): string
{
    return gtcApiBaseUrl().'/api/order-items/bulk-update';
}

function apiOrderItemReviseUrl(int $orderItemId): string
{
    return gtcApiBaseUrl()."/api/order-items/{$orderItemId}/revise";
}

function apiStaffUrl(): string
{
    return gtcApiBaseUrl().'/api/staff';
}

function apiOrderItemAssigneesUrl(int $orderItemId): string
{
    return gtcApiBaseUrl()."/api/order-items/{$orderItemId}/assignees";
}

function apiOrderItemAssigneeDestroyUrl(int $orderItemId, int $userId): string
{
    return gtcApiBaseUrl()."/api/order-items/{$orderItemId}/assignees/{$userId}";
}

function sampleStaffWireUser(int $id = 12): array
{
    return [
        'id' => $id,
        'first_name' => 'Sarah',
        'last_name' => 'Connor',
        'email' => 'sconnor@gtcforce.com',
        'avatar' => 'https://cdn.example.com/avatars/sarah.jpg',
        'organisation_id' => 1,
    ];
}

function sampleParentOrderUpdate(int $orderId = 1): array
{
    return [
        'id' => $orderId,
        'statuses' => [
            ['id' => 2, 'name' => 'In Progress'],
            ['id' => 5, 'name' => 'Cancelled'],
        ],
        'tags' => ['Art', 'Audio'],
        'updated_at' => '2026-06-11T11:17:10.000000Z',
    ];
}

function samplePolymorphicBroadcastOrderItem(int $id = 200): array
{
    return [
        'id' => $id,
        'order_id' => 1,
        'order_menu_item_id' => 1,
        'order_item_status_id' => 1,
        'locked_price' => '250.00',
        'due_date' => '2026-07-25',
        'revision_number' => 0,
        'specifiable_id' => 14,
        'specifiable_type' => 'App\\Models\\OrderItemBroadcastSpecification',
        'specifiable' => [
            'id' => 14,
            'type' => 'Generic',
            'cut' => 'On Sale Now',
            'duration_seconds' => '30',
            'language' => 'English',
            'encoding' => ['Station MP4 (Broadcast)'],
            'isci' => 'ISCI-ABCDEFGH',
            'asset_tracking' => [
                'Voice Over' => false,
                'Audio' => null,
                'Art' => false,
            ],
        ],
        'status_lookup' => [
            'id' => 1,
            'name' => 'Still In Cart',
            'order_status_id' => 1,
        ],
        'revision_instructions' => null,
    ];
}
