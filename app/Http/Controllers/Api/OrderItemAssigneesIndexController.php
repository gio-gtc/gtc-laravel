<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\GtcApiClient;
use App\Support\OrderItemAssigneesApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderItemAssigneesIndexController extends Controller
{
    public function __invoke(Request $request, int $orderItem): JsonResponse
    {
        $client = GtcApiClient::fromRequest($request);

        if ($client === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $result = $client->get("/api/order-items/{$orderItem}/assignees");

        if ($result['ok']) {
            return OrderItemAssigneesApiResponse::successJson(
                $result['data'],
                200,
                'Assignees loaded.',
            );
        }

        return OrderItemAssigneesApiResponse::errorJson($result);
    }
}
