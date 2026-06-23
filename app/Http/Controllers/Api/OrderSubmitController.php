<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\GtcApiClient;
use App\Support\OrdersAssembler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderSubmitController extends Controller
{
    public function __invoke(Request $request, int $order): JsonResponse
    {
        $client = GtcApiClient::fromRequest($request);

        if ($client === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $result = $client->post("/api/orders/{$order}/submit", []);

        if (! $result['ok']) {
            return response()->json(
                ['message' => $result['message']],
                $result['status'] >= 400 ? $result['status'] : 502,
            );
        }

        $payload = $result['data']['data'] ?? $result['data'];
        if (! is_array($payload)) {
            return response()->json(['message' => 'Invalid submit response.'], 502);
        }

        $rawOrder = $payload['order'] ?? null;
        $invoice = $payload['invoice'] ?? null;

        if (! is_array($rawOrder) || ! is_array($invoice)) {
            return response()->json(['message' => 'Invalid submit response.'], 502);
        }

        $normalized = OrdersAssembler::normalizeOrders([$rawOrder])[0] ?? null;

        if ($normalized === null) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        $message = is_string($result['data']['message'] ?? null)
            ? $result['data']['message']
            : 'Order submitted successfully.';

        return response()->json([
            'message' => $message,
            'order' => $normalized,
            'invoice' => $invoice,
        ]);
    }
}
