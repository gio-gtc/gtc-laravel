<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\GtcApiClient;
use App\Support\OrdersAssembler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TourIndexController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $client = GtcApiClient::fromRequest($request);

        if ($client === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $query = OrdersAssembler::tourFilterQueryFromRequest($request);

        if (! isset($query['page'])) {
            $query['page'] = 1;
        }

        $result = $client->get('/api/tours', $query);

        if (! $result['ok']) {
            return response()->json(
                ['message' => $result['message']],
                $result['status'] >= 400 ? $result['status'] : 502,
            );
        }

        $parsed = OrdersAssembler::parseToursPaginationPayload($result['data']);

        return response()->json([
            'current_page' => $parsed['pagination']['current_page'],
            'data' => $parsed['tours'],
            'last_page' => $parsed['pagination']['last_page'],
            'total' => $parsed['pagination']['total'],
            'next_page_url' => $parsed['pagination']['next_page_url'],
        ]);
    }
}
