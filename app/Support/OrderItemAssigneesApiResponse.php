<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

/**
 * Unwrap gtc-api order-item assignee mutation envelopes: { message, data: StaffWireUser[] }.
 */
final class OrderItemAssigneesApiResponse
{
    /**
     * @param  array<string, mixed>  $data
     * @return array<int, array<string, mixed>>
     */
    public static function extractAssignees(array $data): array
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
    public static function successJson(
        array $data,
        int $status = 200,
        string $fallbackMessage = 'Assignees updated.',
    ): JsonResponse {
        $message = $data['message'] ?? $fallbackMessage;

        $payload = [
            'message' => is_string($message) ? $message : $fallbackMessage,
            'assignees' => self::extractAssignees($data),
        ];

        $parentOrderUpdate = OrderItemApiResponse::extractParentOrderUpdate($data);
        if ($parentOrderUpdate !== null) {
            $payload['parent_order_update'] = $parentOrderUpdate;
        }

        return response()->json($payload, $status);
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
