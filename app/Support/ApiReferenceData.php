<?php

namespace App\Support;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

/**
 * Cached gtc-api reference dropdowns + roles for Inertia shared props.
 */
final class ApiReferenceData
{
    /**
     * Lazy shared prop: fallback when guest or empty token without polluting cache.
     *
     * @return array{
     *     org_types: list<mixed>,
     *     countries: list<mixed>,
     *     currency_codes: list<string>,
     *     roles: list<string>,
     * }
     */
    public static function rememberForSession(Request $request): array
    {
        $token = $request->session()->get('api_token');

        if (! is_string($token) || $token === '') {
            return self::fallback();
        }

        return Cache::remember(
            'bff:reference-data:'.hash('sha256', $token),
            now()->addMinutes(5),
            fn (): array => self::fetchUpstreamOrFallback($token),
        );
    }

    /**
     * @return array{
     *     org_types: list<mixed>,
     *     countries: list<mixed>,
     *     currency_codes: list<string>,
     *     roles: list<string>,
     * }
     */
    private static function fetchUpstreamOrFallback(string $token): array
    {
        $baseUrl = rtrim((string) config('services.api.base_url'), '/');
        $refResponse = Http::withToken($token)
            ->acceptJson()
            ->get($baseUrl.'/api/reference-data');

        if (! $refResponse->successful()) {
            return self::fallback();
        }

        $decoded = $refResponse->json();

        if (! is_array($decoded)) {
            return self::fallback();
        }

        $currencyCodes = [];

        if (is_array($decoded['currency_codes'] ?? null)) {
            foreach ($decoded['currency_codes'] as $code) {
                if (is_string($code)) {
                    $currencyCodes[] = $code;
                }
            }
        }

        $roles = [];

        if (is_array($decoded['roles'] ?? null)) {
            $roles = array_values(array_filter($decoded['roles'], 'is_string'));
        }

        $payload = [
            'org_types' => is_array($decoded['org_types'] ?? null)
                ? $decoded['org_types']
                : [],
            'countries' => is_array($decoded['countries'] ?? null)
                ? $decoded['countries']
                : [],
            'currency_codes' => self::currencyCodesWithUsdFirst(array_values($currencyCodes)),
            'roles' => $roles,
        ];

        if ($payload['roles'] === []) {
            $payload['roles'] = self::fetchRoleNamesFallback($token, $baseUrl);
        }

        return $payload;
    }

    /**
     * GET /api/roles when reference-data did not include role names (create-contact UX).
     *
     * @return list<string>
     */
    private static function fetchRoleNamesFallback(string $token, string $baseUrl): array
    {
        $res = Http::withToken($token)
            ->acceptJson()
            ->get($baseUrl.'/api/roles');

        if (! $res->successful()) {
            return [];
        }

        $roles = $res->json('roles');

        return is_array($roles)
            ? array_values(array_filter($roles, 'is_string'))
            : [];
    }

    /**
     * @return array{
     *     org_types: array{},
     *     countries: array{},
     *     currency_codes: array{},
     *     roles: array{},
     * }
     */
    public static function fallback(): array
    {
        return [
            'org_types' => [],
            'countries' => [],
            'currency_codes' => [],
            'roles' => [],
        ];
    }

    /**
     * @param  list<string>  $codes
     * @return list<string>
     */
    private static function currencyCodesWithUsdFirst(array $codes): array
    {
        foreach ($codes as $i => $code) {
            if (strtoupper($code) === 'USD') {
                unset($codes[$i]);

                return array_values(array_merge([$code], $codes));
            }
        }

        return array_values($codes);
    }
}
