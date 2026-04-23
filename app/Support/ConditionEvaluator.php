<?php

namespace App\Support;

/**
 * Mirrors resources/js/lib/forms/conditions.ts.
 *
 * A condition is: { field: string; op: 'eq'|'neq'|'in'; value: mixed }
 * `field` is a dot-path into the full `answers` object (e.g. `order_info.broadcast_type`).
 */
final class ConditionEvaluator
{
    /**
     * @param  array<string, mixed>|null  $rule
     * @param  array<string, mixed>  $values
     */
    public function evaluate(?array $rule, array $values): bool
    {
        if (empty($rule) || ! isset($rule['field'], $rule['op'])) {
            return true;
        }

        $current = data_get($values, $rule['field']);
        $target = $rule['value'] ?? null;

        return match ($rule['op']) {
            'eq' => $current === $target,
            'neq' => $current !== $target,
            'in' => is_array($target) && in_array($current, $target, true),
            default => true,
        };
    }
}
