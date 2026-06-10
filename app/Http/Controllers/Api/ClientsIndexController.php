<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\ClientsApiResponse;
use App\Support\GtcApiClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientsIndexController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $client = GtcApiClient::fromRequest($request);

        if ($client === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $q = $request->query('q');

        if ($q !== null) {
            if (! is_string($q) || strlen(trim($q)) < 2) {
                return ClientsApiResponse::validationTooShortJson();
            }

            $result = $client->get('/api/clients', ['q' => trim($q)]);
        } else {
            $result = $client->get('/api/clients');
        }

        if ($result['ok']) {
            return ClientsApiResponse::successJson($result['data']);
        }

        return ClientsApiResponse::errorJson($result);
    }
}
