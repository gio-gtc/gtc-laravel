<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

/**
 * Unwrap gtc-api client list envelopes: { data: ClientWireUser[] }.
 */
final class ClientsApiResponse
{
    /**
     * @param  array<string, mixed>  $data
     * @return array<int, array<string, mixed>>
     */
    public static function extractClientsList(array $data): array
    {
        $list = $data['data'] ?? null;

        if (! is_array($list)) {
            return [];
        }

        $normalized = [];

        foreach ($list as $row) {
            if (is_array($row)) {
                $normalized[] = $row;
            }
        }

        return $normalized;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public static function successJson(array $data, int $status = 200): JsonResponse
    {
        return response()->json([
            'clients' => self::extractClientsList($data),
        ], $status);
    }

    /**
     * @param  array{ok: false, message: string, status: int, data?: array<string, mixed>}  $result
     */
    public static function errorJson(array $result): JsonResponse
    {
        $status = $result['status'] >= 400 ? $result['status'] : 502;
        $payload = ['message' => $result['message']];

        if (in_array($status, [403, 422], true)) {
            $errors = $result['data']['errors'] ?? null;
            if (is_array($errors)) {
                $payload['errors'] = $errors;
            }
        }

        return response()->json($payload, $status);
    }

    public static function validationTooShortJson(): JsonResponse
    {
        return response()->json([
            'message' => 'The search term must be at least 2 characters.',
            'errors' => [
                'q' => [
                    'The search term must be at least 2 characters.',
                ],
            ],
        ], 422);
    }
}
