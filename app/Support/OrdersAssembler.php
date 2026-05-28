<?php

namespace App\Support;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Merges gtc-api order reads with remaining DemoCatalog mock slices.
 *
 * Prop sources (v1):
 * - orders, grouped_orders: real (GET /api/orders)
 * - order_status_options: static filter metadata
 * - _legacy_orders: mock (old tour-venue hash rows; slideout local-art until v2)
 * - all other forOrders() keys: mock
 */
final class OrdersAssembler
{
    /** @var array<int, array{value: string, label: string}> */
    private const ORDER_STATUS_OPTIONS = [
        ['value' => 'new order', 'label' => 'New Order'],
        ['value' => 'in progress', 'label' => 'In Progress'],
        ['value' => 'client review', 'label' => 'Client Review'],
        ['value' => 'complete', 'label' => 'Complete'],
        ['value' => 'canceled', 'label' => 'Canceled'],
    ];

    /**
     * @return array<string, mixed>
     */
    public static function forIndex(Request $request): array
    {
        $mock = DemoCatalog::forOrders();
        $legacyOrders = $mock['orders'] ?? [];
        unset($mock['orders']);

        $apiSlice = self::fetchOrdersFromApi($request);
        $normalized = self::normalizeOrders($apiSlice['orders']);
        $groupedOrders = self::groupOrdersByTour($normalized);

        return array_merge($mock, [
            'orders' => $normalized,
            'grouped_orders' => $groupedOrders,
            'order_status_options' => self::ORDER_STATUS_OPTIONS,
            '_legacy_orders' => $legacyOrders,
        ]);
    }

    /**
     * @param  array<int, mixed>  $rawOrders
     * @return array<int, array<string, mixed>>
     */
    private static function normalizeOrders(array $rawOrders): array
    {
        $normalized = [];

        foreach ($rawOrders as $raw) {
            if (! is_array($raw)) {
                continue;
            }

            $order = $raw;
            $order['status'] = self::canonicalStatus(
                is_string($raw['status'] ?? null) ? $raw['status'] : '',
            );
            $order['collaborators'] = self::dedupeAssignees($raw['order_items'] ?? []);
            $normalized[] = $order;
        }

        return $normalized;
    }

    private static function canonicalStatus(string $status): string
    {
        $slug = strtolower(trim($status));

        foreach (self::ORDER_STATUS_OPTIONS as $option) {
            if ($option['value'] === $slug) {
                return $slug;
            }
        }

        return $slug;
    }

    /**
     * @return array<int, array{id: int, name: string, email: string}>
     */
    private static function dedupeAssignees(mixed $orderItems): array
    {
        if (! is_array($orderItems)) {
            return [];
        }

        $seen = [];
        $collaborators = [];

        foreach ($orderItems as $item) {
            if (! is_array($item)) {
                continue;
            }

            $assignees = $item['assignees'] ?? [];
            if (! is_array($assignees)) {
                continue;
            }

            foreach ($assignees as $assignee) {
                if (! is_array($assignee)) {
                    continue;
                }

                $id = $assignee['id'] ?? null;
                if (! is_int($id) && ! is_numeric($id)) {
                    continue;
                }

                $id = (int) $id;
                if (isset($seen[$id])) {
                    continue;
                }

                $seen[$id] = true;
                $collaborators[] = [
                    'id' => $id,
                    'name' => is_string($assignee['name'] ?? null) ? $assignee['name'] : '',
                    'email' => is_string($assignee['email'] ?? null) ? $assignee['email'] : '',
                ];
            }
        }

        return $collaborators;
    }

    /**
     * @param  array<int, array<string, mixed>>  $orders
     * @return array<int, array{tour: array{id: int, name: string}, orders: array<int, array<string, mixed>>}>
     */
    private static function groupOrdersByTour(array $orders): array
    {
        /** @var array<int, array{tour: array{id: int, name: string}, orders: array<int, array<string, mixed>>}> */
        $byTour = [];

        foreach ($orders as $order) {
            $tour = $order['tour'] ?? null;
            $tourId = is_array($tour) && isset($tour['id'])
                ? (int) $tour['id']
                : (int) ($order['tour_id'] ?? 0);
            $tourName = is_array($tour) && is_string($tour['name'] ?? null)
                ? $tour['name']
                : 'Unknown tour';

            if (! isset($byTour[$tourId])) {
                $byTour[$tourId] = [
                    'tour' => ['id' => $tourId, 'name' => $tourName],
                    'orders' => [],
                ];
            }

            $byTour[$tourId]['orders'][] = $order;
        }

        foreach ($byTour as &$group) {
            usort($group['orders'], fn (array $a, array $b): int => self::compareDueDateDesc($a, $b));
        }
        unset($group);

        $groups = array_values($byTour);

        usort($groups, function (array $a, array $b): int {
            $aCreated = self::maxCreatedAtTimestamp($a['orders']);
            $bCreated = self::maxCreatedAtTimestamp($b['orders']);

            return $bCreated <=> $aCreated;
        });

        return $groups;
    }

    /**
     * @param  array<int, array<string, mixed>>  $orders
     */
    private static function maxCreatedAtTimestamp(array $orders): int
    {
        $max = 0;

        foreach ($orders as $order) {
            $createdAt = $order['created_at'] ?? null;
            if (! is_string($createdAt) || $createdAt === '') {
                continue;
            }

            $timestamp = strtotime($createdAt);
            if ($timestamp !== false && $timestamp > $max) {
                $max = $timestamp;
            }
        }

        return $max;
    }

    /**
     * @param  array<string, mixed>  $a
     * @param  array<string, mixed>  $b
     */
    private static function compareDueDateDesc(array $a, array $b): int
    {
        $aTs = self::parseDateTimestamp($a['due_date'] ?? null);
        $bTs = self::parseDateTimestamp($b['due_date'] ?? null);

        return $bTs <=> $aTs;
    }

    private static function parseDateTimestamp(mixed $value): int
    {
        if (! is_string($value) || $value === '') {
            return 0;
        }

        $timestamp = strtotime($value);

        return $timestamp !== false ? $timestamp : 0;
    }

    /**
     * @return array{orders: array<int, mixed>, grouped_orders: array<int, mixed>}
     */
    private static function fetchOrdersFromApi(Request $request): array
    {
        $empty = [
            'orders' => [],
            'grouped_orders' => [],
        ];

        $token = $request->session()->get('api_token');

        if (! is_string($token) || $token === '') {
            return $empty;
        }

        $baseUrl = rtrim((string) config('services.api.base_url'), '/');
        $response = Http::withToken($token)
            ->acceptJson()
            ->get($baseUrl.'/api/orders');

        if ($response->successful()) {
            $orders = $response->json('orders');

            return [
                'orders' => is_array($orders) ? $orders : [],
                'grouped_orders' => [],
            ];
        }

        $message = $response->json('message');
        $errorMessage = is_string($message) && $message !== ''
            ? $message
            : 'Could not load orders right now. Please try again.';

        Log::error('gtc-api orders index failed', [
            'status' => $response->status(),
            'body' => $response->body(),
        ]);

        $request->session()->flash('error', $errorMessage);

        return $empty;
    }
}
