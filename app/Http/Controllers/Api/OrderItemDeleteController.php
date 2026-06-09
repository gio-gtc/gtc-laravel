<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\GtcApiClient;
use App\Support\OrderItemApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderItemDeleteController extends Controller
{
    public function __invoke(Request $request, int $orderItem): JsonResponse
    {
        $client = GtcApiClient::fromRequest($request);

        if ($client === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $result = $client->delete("/api/order-items/{$orderItem}");

        if ($result['ok']) {
            return OrderItemApiResponse::successJson(
                $result['data'],
                200,
                'Line item removed.',
            );
        }

        return OrderItemApiResponse::errorJson($result);
    }
}
