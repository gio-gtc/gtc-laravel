<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

/**
 * Unwrap gtc-api staff list envelopes: { data: StaffWireUser[] }.
 */
final class StaffApiResponse
{
    /**
     * @param  array<string, mixed>  $data
     * @return array<int, array<string, mixed>>
     */
    public static function extractStaffList(array $data): array
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
            'staff' => self::extractStaffList($data),
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
}
