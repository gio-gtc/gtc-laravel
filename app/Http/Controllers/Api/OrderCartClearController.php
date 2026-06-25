<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\GtcApiClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderCartClearController extends Controller
{
    public function __invoke(Request $request, int $order): JsonResponse
    {
        $client = GtcApiClient::fromRequest($request);

        if ($client === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $result = $client->delete("/api/orders/{$order}/cart");

        if (! $result['ok']) {
            return response()->json(
                ['message' => $result['message']],
                $result['status'] >= 400 ? $result['status'] : 502,
            );
        }

        $payload = $result['data'];

        $message = $payload['message'] ?? null;
        $orderDeleted = $payload['order_deleted'] ?? null;
        $count = $payload['count'] ?? null;

        if (! is_string($message) || ! is_bool($orderDeleted) || ! is_int($count)) {
            return response()->json(['message' => 'Invalid clear cart response.'], 502);
        }

        return response()->json([
            'message' => $message,
            'order_deleted' => $orderDeleted,
            'count' => $count,
        ]);
    }
}
