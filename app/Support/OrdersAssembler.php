<?php

namespace App\Support;

use Illuminate\Http\Request;

/**
 * BFF assembly for orders dashboard (tour feed + order normalization).
 *
 * Prop sources:
 * - tours, tours_pagination: gtc-api GET /api/tours
 * - order_status_options: order container statuses (Title Case wire values)
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

    /** Query keys forwarded from browser to gtc-api tour endpoints. */
    private const TOUR_FILTER_KEYS = [
        'page',
        'search',
        'client_ids',
        'assignee_ids',
        'statuses',
        'asset_tags',
        'is_international',
        'filter',
    ];

    /**
     * @return array<string, mixed>
     */
    public static function forIndex(Request $request): array
    {
        $toursPayload = self::fetchToursPage($request, 1);

        return array_merge(
            [
                'tours' => $toursPayload['tours'],
                'tours_pagination' => $toursPayload['pagination'],
                'order_status_options' => self::orderStatusOptions(),
            ],
            self::slideoutCatalogSlices(),
        );
    }

    /**
     * @return array<string, mixed>
     */
    public static function tourFilterQueryFromRequest(Request $request): array
    {
        $query = [];

        foreach (self::TOUR_FILTER_KEYS as $key) {
            if (! $request->has($key)) {
                continue;
            }

            $value = $request->query($key);

            if ($value === null || $value === '') {
                continue;
            }

            $query[$key] = $value;
        }

        return $query;
    }

    /**
     * @return array{tours: array<int, array{id: int, name: string}>, pagination: array{current_page: int, last_page: int, total: int, next_page_url: string|null}}
     */
    public static function fetchToursPage(Request $request, int $page = 1): array
    {
        $empty = [
            'tours' => [],
            'pagination' => [
                'current_page' => 1,
                'last_page' => 1,
                'total' => 0,
                'next_page_url' => null,
            ],
        ];

        $client = GtcApiClient::fromRequest($request);

        if ($client === null) {
            return $empty;
        }

        $query = array_merge(
            self::tourFilterQueryFromRequest($request),
            ['page' => $page],
        );

        $result = $client->get('/api/tours', $query);

        if (! $result['ok']) {
            $request->session()->flash('error', $result['message']);

            return $empty;
        }

        return self::parseToursPaginationPayload($result['data']);
    }

    /**
     * @param  array<int, mixed>  $rawOrders
     * @return array<int, array<string, mixed>>
     */
    public static function normalizeOrders(array $rawOrders): array
    {
        $normalized = [];

        foreach ($rawOrders as $raw) {
            if (! is_array($raw)) {
                continue;
            }

            $order = $raw;
            $order['collaborators'] = self::dedupeAssignees($raw['order_items'] ?? []);
            if (isset($order['order_items']) && is_array($order['order_items'])) {
                $order['order_items'] = OrderItemNormalizer::normalizeItems($order['order_items']);
            }
            $normalized[] = $order;
        }

        return $normalized;
    }

    /**
     * Reference data for legacy order slideout (status dropdowns, Local Art mock lines).
     *
     * @return array<string, mixed>
     */
    private static function slideoutCatalogSlices(): array
    {
        $allVenueItems = config('mockdata.venue_items', []);
        $localizedItems = [];

        if (is_array($allVenueItems)) {
            foreach ($allVenueItems as $row) {
                if (is_array($row) && ($row['type'] ?? null) === 'localized') {
                    $localizedItems[] = $row;
                }
            }
        }

        return [
            'venue_items' => $localizedItems,
            'venue_item_status' => config('mockdata.venue_item_status', []),
            'venue_item_language' => config('mockdata.venue_item_language', []),
            'venue_item_encoding' => config('mockdata.venue_item_encoding', []),
            'venue_item_assigned' => [],
            'venue_item_notes' => [],
            'invoices' => config('mockdata.invoices', []),
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
     * @return array{tours: array<int, array{id: int, name: string}>, pagination: array{current_page: int, last_page: int, total: int, next_page_url: string|null}}
     */
    public static function parseToursPaginationPayload(mixed $body): array
    {
        $empty = [
            'tours' => [],
            'pagination' => [
                'current_page' => 1,
                'last_page' => 1,
                'total' => 0,
                'next_page_url' => null,
            ],
        ];

        if (! is_array($body)) {
            return $empty;
        }

        $envelope = isset($body['data']) && is_array($body['data']) && ! array_is_list($body['data'])
            ? $body['data']
            : $body;

        $data = $envelope['data'] ?? $body['data'] ?? [];
        if (! is_array($data)) {
            $data = [];
        }

        $tours = [];
        foreach ($data as $row) {
            if (! is_array($row)) {
                continue;
            }

            $id = $row['id'] ?? null;
            $name = $row['name'] ?? null;

            if (! is_numeric($id) || ! is_string($name)) {
                continue;
            }

            $tours[] = [
                'id' => (int) $id,
                'name' => $name,
            ];
        }

        return [
            'tours' => $tours,
            'pagination' => [
                'current_page' => (int) ($envelope['current_page'] ?? 1),
                'last_page' => (int) ($envelope['last_page'] ?? 1),
                'total' => (int) ($envelope['total'] ?? count($tours)),
                'next_page_url' => is_string($envelope['next_page_url'] ?? null)
                    ? $envelope['next_page_url']
                    : null,
            ],
        ];
    }

    /**
     * @return array<int, array{id: int, name: string, email: string, first_name: string|null, last_name: string|null}>
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

                $firstName = is_string($assignee['first_name'] ?? null)
                    ? trim($assignee['first_name'])
                    : '';
                $lastName = is_string($assignee['last_name'] ?? null)
                    ? trim($assignee['last_name'])
                    : '';
                $name = is_string($assignee['name'] ?? null)
                    ? trim($assignee['name'])
                    : '';
                if ($name === '') {
                    $name = trim($firstName.' '.$lastName);
                }

                $collaborators[] = [
                    'id' => $id,
                    'name' => $name,
                    'email' => is_string($assignee['email'] ?? null) ? $assignee['email'] : '',
                    'first_name' => $firstName !== '' ? $firstName : null,
                    'last_name' => $lastName !== '' ? $lastName : null,
                ];
            }
        }

        return $collaborators;
    }
}
