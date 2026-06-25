<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\GtcApiClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderCatalogMenuController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $client = GtcApiClient::fromRequest($request);

        if ($client === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $result = $client->get('/api/order-catalog-menu');

        if (! $result['ok']) {
            return response()->json(
                ['message' => $result['message']],
                $result['status'] >= 400 ? $result['status'] : 502,
            );
        }

        $catalog = GtcApiClient::unwrapList($result['data'], 'catalog') ?? [];

        return response()->json([
            'data' => is_array($catalog) ? $catalog : [],
        ]);
    }
}
