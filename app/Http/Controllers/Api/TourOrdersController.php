<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\GtcApiClient;
use App\Support\OrdersAssembler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TourOrdersController extends Controller
{
    public function __invoke(Request $request, int $tour): JsonResponse
    {
        $client = GtcApiClient::fromRequest($request);

        if ($client === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $query = OrdersAssembler::tourFilterQueryFromRequest($request);
        unset($query['page']);

        $result = $client->get("/api/tours/{$tour}/orders", $query);

        if (! $result['ok']) {
            return response()->json(
                ['message' => $result['message']],
                $result['status'] >= 400 ? $result['status'] : 502,
            );
        }

        $orders = GtcApiClient::unwrapList($result['data'], 'orders')
            ?? (is_array($result['data']['data'] ?? null) ? $result['data']['data'] : []);

        if (! is_array($orders)) {
            $orders = [];
        }

        $normalized = OrdersAssembler::normalizeOrders($orders);

        return response()->json(['data' => $normalized]);
    }
}
