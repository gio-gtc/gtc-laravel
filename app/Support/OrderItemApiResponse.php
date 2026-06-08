<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

/**
 * Unwrap gtc-api order-item mutation envelopes: { message, data: OrderItem }.
 */
final class OrderItemApiResponse
{
    /**
     * @param  array<string, mixed>  $data  Raw gtc-api JSON body on success
     * @return array<string, mixed>|null
     */
    public static function extractOrderItem(array $data): ?array
    {
        $item = $data['data'] ?? null;

        if (is_array($item) && isset($item['id'], $item['order_id'])) {
            return $item;
        }

        if (isset($data['id'], $data['order_id']) && is_array($data)) {
            return $data;
        }

        return null;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public static function successJson(
        array $data,
        int $status = 200,
        string $fallbackMessage = 'OK',
    ): JsonResponse {
        $item = self::extractOrderItem($data);
        $message = $data['message'] ?? $fallbackMessage;

        if ($item === null) {
            return response()->json(['message' => 'Invalid order item response from API.'], 502);
        }

        return response()->json([
            'message' => is_string($message) ? $message : $fallbackMessage,
            'order_item' => $item,
        ], $status);
    }

    /**
     * @param  array{ok: false, message: string, status: int, data?: array<string, mixed>}  $result
     */
    public static function errorJson(array $result): JsonResponse
    {
        $status = $result['status'] >= 400 ? $result['status'] : 502;
        $payload = ['message' => $result['message']];

        if ($status === 422) {
            $errors = $result['data']['errors'] ?? null;
            if (is_array($errors)) {
                $payload['errors'] = $errors;
            }
        }

        return response()->json($payload, $status);
    }
}
