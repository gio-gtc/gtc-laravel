<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\GtcApiClient;
use App\Support\StaffApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StaffIndexController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $client = GtcApiClient::fromRequest($request);

        if ($client === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $result = $client->get('/api/staff');

        if ($result['ok']) {
            return StaffApiResponse::successJson($result['data']);
        }

        return StaffApiResponse::errorJson($result);
    }
}
