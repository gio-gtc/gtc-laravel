<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

/**
 * Safety checks that cannot be expressed in pure JSON Schema:
 *
 *  1. File fields: verify `path` values submitted by the client were actually
 *     issued by {@see \App\Http\Controllers\UploadController::store}. The
 *     controller stashes each path in the cache under a session-scoped key;
 *     submissions must reference one of those entries.
 *  2. Extra items: a venue form's `extra_items` entries in overrides are
 *     whitelisted at resolve time; this class verifies submitted item keys
 *     match the resolved UI set (catalog keys + extra_items keys) exactly.
 */
final class ItemCatalogGuard
{
    public const UPLOAD_CACHE_TTL_MINUTES = 120;

    /** Cache key namespace for uploaded file paths issued in a given session/share-link scope. */
    public static function uploadCacheKey(string $scopeKey): string
    {
        return 'form-uploads:'.sha1($scopeKey);
    }

    /**
     * Record that $path was just issued for $scopeKey. Use the request's session id
     * or share-link token as the scope key.
     */
    public static function rememberUploadedPath(string $scopeKey, string $path): void
    {
        $key = self::uploadCacheKey($scopeKey);
        $paths = Cache::get($key, []);
        $paths[$path] = true;
        Cache::put($key, $paths, now()->addMinutes(self::UPLOAD_CACHE_TTL_MINUTES));
    }

    /**
     * Return true iff $path was recorded under $scopeKey within the retention window.
     */
    public static function isPathIssued(string $scopeKey, string $path): bool
    {
        $paths = Cache::get(self::uploadCacheKey($scopeKey), []);

        return isset($paths[$path]);
    }

    /**
     * Recursively sweep $answers for file-descriptor objects with a `path` key.
     * Returns an array of [dotPath, pathValue] tuples for the caller to verify.
     *
     * @param  array<string, mixed>  $answers
     * @return array<int, array{0: string, 1: string}>
     */
    public static function collectFilePaths(array $answers, string $prefix = ''): array
    {
        $out = [];
        foreach ($answers as $k => $v) {
            $dot = $prefix === '' ? (string) $k : $prefix.'.'.$k;
            if (is_array($v) && array_is_list($v)) {
                foreach ($v as $i => $item) {
                    $dotI = $dot.'.'.$i;
                    if (is_array($item) && isset($item['path']) && is_string($item['path'])) {
                        $out[] = [$dotI, $item['path']];
                    } elseif (is_array($item)) {
                        $out = array_merge($out, self::collectFilePaths($item, $dotI));
                    }
                }
            } elseif (is_array($v)) {
                if (isset($v['path']) && is_string($v['path']) && isset($v['size'])) {
                    $out[] = [$dot, $v['path']];
                } else {
                    $out = array_merge($out, self::collectFilePaths($v, $dot));
                }
            }
        }

        return $out;
    }

    /**
     * Verify that every submitted item key in item_list blocks is part of
     * the resolved allowed set for that block.
     *
     * @param  array<int, array<string, mixed>>  $blocks  resolved blocks from SchemaResolver
     * @param  array<string, mixed>  $answers
     * @return array<int, array{0: string, 1: string}> list of [dotPath, violatingKey]
     */
    public static function findUnknownItemKeys(array $blocks, array $answers): array
    {
        $violations = [];
        foreach ($blocks as $block) {
            if (($block['kind'] ?? null) !== 'item_list') {
                continue;
            }
            $blockKey = $block['key'];
            $allowed = array_flip(array_values(array_filter(array_map(
                static fn (array $i) => $i['key'] ?? null,
                $block['items'] ?? []
            ))));
            $selected = data_get($answers, $blockKey.'.selected', []);
            if (! is_array($selected)) {
                continue;
            }
            foreach ($selected as $i => $key) {
                if (! is_string($key) || ! isset($allowed[$key])) {
                    $violations[] = [$blockKey.'.selected.'.$i, (string) $key];
                }
            }
        }

        return $violations;
    }

    /** Generate a short, high-entropy token suitable for keying per-session upload scopes. */
    public static function scopeKey(string $prefix = 'session'): string
    {
        return $prefix.':'.Str::random(32);
    }
}
