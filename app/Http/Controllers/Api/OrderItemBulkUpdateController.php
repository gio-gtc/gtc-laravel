<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\GtcApiClient;
use App\Support\OrderItemBulkUpdateApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class OrderItemBulkUpdateController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $client = GtcApiClient::fromRequest($request);

        if ($client === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $validated = $request->validate([
            'order_item_ids' => ['required', 'array', 'min:1'],
            'order_item_ids.*' => ['integer', 'min:1'],
            'due_date' => ['sometimes', 'date'],
            'order_item_status_id' => ['sometimes', 'integer', 'min:1'],
            'assignee_ids' => ['sometimes', 'array'],
            'assignee_ids.*' => ['integer', 'min:1'],
            'specifications' => ['sometimes', 'array'],
        ]);

        $payload = [
            'order_item_ids' => array_map('intval', $validated['order_item_ids']),
        ];

        if (array_key_exists('due_date', $validated)) {
            $payload['due_date'] = $validated['due_date'] instanceof \DateTimeInterface
                ? $validated['due_date']->format('Y-m-d')
                : (string) $validated['due_date'];
        }

        if (array_key_exists('order_item_status_id', $validated)) {
            $payload['order_item_status_id'] = (int) $validated['order_item_status_id'];
        }

        if (array_key_exists('assignee_ids', $validated)) {
            $payload['assignee_ids'] = array_map('intval', $validated['assignee_ids']);
        }

        if (array_key_exists('specifications', $validated)) {
            $payload['specifications'] = $validated['specifications'];
        }

        if (count($payload) === 1) {
            throw ValidationException::withMessages([
                'order_item_ids' => ['At least one field to update is required alongside order_item_ids.'],
            ]);
        }

        $result = $client->post('/api/order-items/bulk-update', $payload);

        if ($result['ok']) {
            return OrderItemBulkUpdateApiResponse::successJson(
                $result['data'],
                200,
                'Selected order line items batch-updated successfully.',
            );
        }

        return OrderItemBulkUpdateApiResponse::errorJson($result);
    }
}
