<?php

namespace App\Support;

/**
 * Normalize gtc-api order item payloads for BFF JSON responses.
 */
final class OrderItemNormalizer
{
    /**
     * @param  array<string, mixed>  $item
     * @return array<string, mixed>
     */
    public static function normalizeItem(array $item): array
    {
        if (isset($item['status_lookup']) && is_array($item['status_lookup'])) {
            $name = $item['status_lookup']['name'] ?? null;
            if ($name === 'Canceled') {
                $item['status_lookup']['name'] = 'Cancelled';
            }
        }

        return $item;
    }

    /**
     * @param  array<int, mixed>  $items
     * @return array<int, array<string, mixed>>
     */
    public static function normalizeItems(array $items): array
    {
        $normalized = [];

        foreach ($items as $item) {
            if (! is_array($item)) {
                continue;
            }

            $normalized[] = self::normalizeItem($item);
        }

        return $normalized;
    }
}
