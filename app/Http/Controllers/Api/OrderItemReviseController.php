<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\GtcApiClient;
use App\Support\OrderItemApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderItemReviseController extends Controller
{
    public function __invoke(Request $request, int $orderItem): JsonResponse
    {
        $client = GtcApiClient::fromRequest($request);

        if ($client === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $validated = $request->validate([
            'comment' => ['required', 'string', 'min:1', 'max:5000'],
        ]);

        $result = $client->post("/api/order-items/{$orderItem}/revise", [
            'comment' => $validated['comment'],
        ]);

        if ($result['ok']) {
            return OrderItemApiResponse::successJson(
                $result['data'],
                201,
                'Item revision successfully initialized.',
            );
        }

        return OrderItemApiResponse::errorJson($result);
    }
}
