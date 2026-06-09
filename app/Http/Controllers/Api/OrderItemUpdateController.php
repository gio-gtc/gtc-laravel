<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\GtcApiClient;
use App\Support\OrderItemApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderItemUpdateController extends Controller
{
    public function __invoke(Request $request, int $orderItem): JsonResponse
    {
        $client = GtcApiClient::fromRequest($request);

        if ($client === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $validated = $request->validate([
            'due_date' => ['required', 'date'],
            'specifications' => ['required', 'array'],
        ]);

        $payload = [
            'due_date' => $validated['due_date'] instanceof \DateTimeInterface
                ? $validated['due_date']->format('Y-m-d')
                : (string) $validated['due_date'],
            'specifications' => $validated['specifications'],
        ];

        $result = $client->patch("/api/order-items/{$orderItem}", $payload);

        if ($result['ok']) {
            return OrderItemApiResponse::successJson(
                $result['data'],
                200,
                'Line item updated.',
            );
        }

        return OrderItemApiResponse::errorJson($result);
    }
}
