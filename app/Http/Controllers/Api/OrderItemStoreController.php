<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\GtcApiClient;
use App\Support\OrderItemApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderItemStoreController extends Controller
{
    public function __invoke(Request $request, int $order): JsonResponse
    {
        $client = GtcApiClient::fromRequest($request);

        if ($client === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $validated = $request->validate([
            'order_menu_item_id' => ['required', 'integer', 'min:1'],
            'due_date' => ['required', 'date'],
            'specifications' => ['required', 'array'],
            'assignee_ids' => ['sometimes', 'array'],
            'assignee_ids.*' => ['integer', 'min:1'],
        ]);

        $payload = [
            'order_menu_item_id' => (int) $validated['order_menu_item_id'],
            'due_date' => $validated['due_date'] instanceof \DateTimeInterface
                ? $validated['due_date']->format('Y-m-d')
                : (string) $validated['due_date'],
            'specifications' => $validated['specifications'],
        ];

        if (isset($validated['assignee_ids'])) {
            $payload['assignee_ids'] = array_map('intval', $validated['assignee_ids']);
        }

        $result = $client->post("/api/orders/{$order}/items", $payload);

        if ($result['ok']) {
            return OrderItemApiResponse::successJson(
                $result['data'],
                201,
                'Line item created.',
            );
        }

        return OrderItemApiResponse::errorJson($result);
    }
}
