<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\GtcApiClient;
use App\Support\OrdersAssembler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderUpdateController extends Controller
{
    private const HEADER_DESCRIPTION_KEYS = [
        'ticket_outlets',
        'on_same_date',
        'cardholder_times',
        'logos',
        'special_instructions',
    ];

    public function __invoke(Request $request, int $order): JsonResponse
    {
        $client = GtcApiClient::fromRequest($request);

        if ($client === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $rules = [
            'show_dates' => ['sometimes', 'array'],
            'show_dates.*.id' => ['sometimes', 'integer', 'min:1'],
            'show_dates.*.show_date' => ['required_with:show_dates', 'date'],
        ];

        foreach (self::HEADER_DESCRIPTION_KEYS as $key) {
            $rules[$key] = ['sometimes', 'nullable', 'string', 'max:5000'];
        }

        $validated = $request->validate($rules);

        $payload = array_intersect_key(
            $validated,
            array_flip(self::HEADER_DESCRIPTION_KEYS),
        );

        if (array_key_exists('show_dates', $validated)) {
            $payload['show_dates'] = self::normalizeShowDatesForApi(
                $validated['show_dates'],
            );
        }

        if ($payload === []) {
            return response()->json(
                ['message' => 'At least one editable order field is required.'],
                422,
            );
        }

        $result = $client->patch("/api/orders/{$order}", $payload);

        if (! $result['ok']) {
            return response()->json(
                ['message' => $result['message']],
                $result['status'] >= 400 ? $result['status'] : 502,
            );
        }

        $raw = GtcApiClient::unwrapResource($result['data'], 'order');

        if (! is_array($raw)) {
            return response()->json(['ok' => true]);
        }

        $normalized = OrdersAssembler::normalizeOrders([$raw])[0] ?? null;

        if ($normalized === null) {
            return response()->json(['ok' => true]);
        }

        return response()->json(['order' => $normalized]);
    }

    /**
     * @param  array<int, mixed>  $rows
     * @return array<int, array<string, mixed>>
     */
    private static function normalizeShowDatesForApi(array $rows): array
    {
        $normalized = [];

        foreach ($rows as $row) {
            if (! is_array($row)) {
                continue;
            }

            $showDate = $row['show_date'] ?? null;
            if (! is_string($showDate) || $showDate === '') {
                continue;
            }

            $entry = ['show_date' => $showDate];

            $id = $row['id'] ?? null;
            if (is_int($id) || (is_numeric($id) && (int) $id > 0)) {
                $entry['id'] = (int) $id;
            }

            $normalized[] = $entry;
        }

        return $normalized;
    }
}
