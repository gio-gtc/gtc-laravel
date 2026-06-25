<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

/**
 * Unwrap gtc-api bulk-update envelopes: { message, meta }.
 */
final class OrderItemBulkUpdateApiResponse
{
    /**
     * @param  array<string, mixed>  $data  Raw gtc-api JSON body on success
     */
    public static function successJson(
        array $data,
        int $status = 200,
        string $fallbackMessage = 'OK',
    ): JsonResponse {
        $message = $data['message'] ?? $fallbackMessage;
        $meta = $data['meta'] ?? null;

        if (! is_array($meta)) {
            return response()->json(['message' => 'Invalid bulk update response from API.'], 502);
        }

        return response()->json([
            'message' => is_string($message) ? $message : $fallbackMessage,
            'meta' => $meta,
        ] + self::virtualBillingLinesPayload($data), $status);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private static function virtualBillingLinesPayload(array $data): array
    {
        $lines = OrderItemApiResponse::extractVirtualBillingLines($data);

        return $lines !== [] ? ['virtual_billing_lines' => $lines] : [];
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
