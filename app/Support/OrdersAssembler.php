<?php

namespace App\Support;

use Illuminate\Http\Request;

/**
 * BFF assembly for GET /api/orders index (list + tour grouping).
 *
 * Prop sources:
 * - orders, grouped_orders: gtc-api GET /api/orders
 * - order_status_options: order container statuses (Title Case wire values)
 *
 * TODO: fetchOrderShow(int $id) → GET /api/orders/{id} for slideout detail (follow-up PR).
 */
final class OrdersAssembler
{
    /** Order container statuses (gtc-api wire format). */
    private const ORDER_STATUSES = [
        'New Order',
        'In Progress',
        'Client Review',
        'Complete',
        'Canceled',
    ];

    /**
     * @return array<string, mixed>
     */
    public static function forIndex(Request $request): array
    {
        $rawOrders = self::fetchOrdersFromApi($request);
        $normalized = self::normalizeOrders($rawOrders);
        $groupedOrders = self::groupOrdersByTour($normalized);

        return [
            'orders' => $normalized,
            'grouped_orders' => $groupedOrders,
            'order_status_options' => self::orderStatusOptions(),
        ];
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    private static function orderStatusOptions(): array
    {
        $options = [];

        foreach (self::ORDER_STATUSES as $status) {
            $options[] = [
                'value' => $status,
                'label' => $status,
            ];
        }

        return $options;
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
            $order['collaborators'] = self::dedupeAssignees($raw['order_items'] ?? []);
            $normalized[] = $order;
        }

        return $normalized;
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
     * @return array<int, mixed>
     */
    private static function fetchOrdersFromApi(Request $request): array
    {
        $client = GtcApiClient::fromRequest($request);

        if ($client === null) {
            return [];
        }

        $result = $client->get('/api/orders');

        if (! $result['ok']) {
            $request->session()->flash('error', $result['message']);

            return [];
        }

        $orders = GtcApiClient::unwrapList($result['data'], 'orders');

        return $orders ?? [];
    }
}
