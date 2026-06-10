<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\GtcApiClient;
use App\Support\OrderItemAssigneesApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderItemAssigneesSyncController extends Controller
{
    public function __invoke(Request $request, int $orderItem): JsonResponse
    {
        $client = GtcApiClient::fromRequest($request);

        if ($client === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $validated = $request->validate([
            'user_ids' => ['present', 'array'],
            'user_ids.*' => ['integer', 'min:1'],
        ]);

        $payload = [
            'user_ids' => array_map('intval', $validated['user_ids']),
        ];

        $result = $client->post("/api/order-items/{$orderItem}/assignees", $payload);

        if ($result['ok']) {
            return OrderItemAssigneesApiResponse::successJson(
                $result['data'],
                200,
                'Line item assignees synced successfully.',
            );
        }

        return OrderItemAssigneesApiResponse::errorJson($result);
    }
}
