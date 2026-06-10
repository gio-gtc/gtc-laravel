<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\GtcApiClient;
use App\Support\OrderItemAssigneesApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderItemAssigneesDestroyController extends Controller
{
    public function __invoke(Request $request, int $orderItem, int $user): JsonResponse
    {
        $client = GtcApiClient::fromRequest($request);

        if ($client === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $result = $client->delete("/api/order-items/{$orderItem}/assignees/{$user}");

        if ($result['ok']) {
            return OrderItemAssigneesApiResponse::successJson(
                $result['data'],
                200,
                'Assignee detached from line item successfully.',
            );
        }

        return OrderItemAssigneesApiResponse::errorJson($result);
    }
}
