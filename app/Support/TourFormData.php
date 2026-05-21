<?php

namespace App\Support;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

/**
 * Cached gtc-api tour modal dropdowns for Inertia shared props.
 *
 * GET /api/users, GET /api/departments (gtc-api).
 */
final class TourFormData
{
    /**
     * @return array{
     *     departments: list<array<string, mixed>>,
     *     gtcReps: list<array<string, mixed>>,
     *     voiceOvers: list<array<string, mixed>>,
     * }
     */
    public static function rememberForSession(Request $request): array
    {
        $token = $request->session()->get('api_token');

        if (! is_string($token) || $token === '') {
            return self::fallback();
        }

        return Cache::remember(
            'bff:tour-form-data:'.hash('sha256', $token),
            now()->addMinutes(5),
            fn (): array => self::fetchUpstreamOrFallback($token),
        );
    }

    /**
     * @return array{
     *     departments: list<array<string, mixed>>,
     *     gtcReps: list<array<string, mixed>>,
     *     voiceOvers: list<array<string, mixed>>,
     * }
     */
    private static function fetchUpstreamOrFallback(string $token): array
    {
        $baseUrl = config('services.api.base_url');
        $gtcReps = [];
        $voiceOvers = [];
        $departments = [];

        if ($token) {
            $usersResponse = Http::withToken($token)->get("{$baseUrl}/api/users");
            $departmentsResponse = Http::withToken($token)->get("{$baseUrl}/api/departments");

            $allUsers = collect($usersResponse->json('users' ?? []));
            $departments = $departmentsResponse->json('departments' ?? []);

            // Apply filters
            $gtcReps = $allUsers->where('organisation_id', 1)->values()->all();
            $voiceOvers = $allUsers->filter(function ($user) {
                // 1. Safely grab the types array
                $types = $user['organisation']['types'] ?? [];
                
                // 2. Use an explicit closure to scan the array and cast the ID to an integer
                return collect($types)->contains(function ($type) {
                    return (int)($type['id'] ?? 0) === 3;
                });
            })->values()->all();
        }


        return [
            'departments' => $departments,
            'gtcReps' => $gtcReps,
            'voiceOvers' => $voiceOvers,
        ];
    }

    /**
     * @return array{
     *     departments: array{},
     *     gtcReps: array{},
     *     voiceOvers: array{},
     * }
     */
    public static function fallback(): array
    {
        return [
            'departments' => [],
            'gtcReps' => [],
            'voiceOvers' => [],
        ];
    }
}
