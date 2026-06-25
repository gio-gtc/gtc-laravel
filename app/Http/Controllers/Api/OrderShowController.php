<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\GtcApiClient;
use App\Support\OrdersAssembler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderShowController extends Controller
{
    public function __invoke(Request $request, int $order): JsonResponse
    {
        $client = GtcApiClient::fromRequest($request);

        if ($client === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $result = $client->get("/api/orders/{$order}");

        if (! $result['ok']) {
            return response()->json(
                ['message' => $result['message']],
                $result['status'] >= 400 ? $result['status'] : 502,
            );
        }

        $raw = GtcApiClient::unwrapResource($result['data'], 'order');

        if (! is_array($raw)) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        $normalized = OrdersAssembler::normalizeOrders([$raw])[0] ?? null;

        if ($normalized === null) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        $virtualBillingLines = $result['data']['virtual_billing_lines'] ?? [];

        return response()->json([
            'order' => $normalized,
            'virtual_billing_lines' => is_array($virtualBillingLines) ? $virtualBillingLines : [],
        ]);
    }
}
