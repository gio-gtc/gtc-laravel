<?php

namespace App\Http\Middleware;

use App\Support\ApiReferenceData;
use App\Support\ApiUserForInertia;
use App\Support\DemoCatalog;
use App\Support\TourFormData;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $users = [];

        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $sessionUser = $request->session()->get('user');
        $bffAuthenticated = $request->session()->has('api_token');

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => is_array($sessionUser)
                    ? ApiUserForInertia::normalize($sessionUser)
                    : $sessionUser,
                'roles' => self::sessionStringList($request->session()->get('roles')),
                'permissions' => self::sessionStringList($request->session()->get('permissions')),
                'token' => $request->session()->get('api_token'),
            ],
            'name' => config('app.name'),
            'assetCdnBaseUrl' => config('services.assets.cdn_base_url') ?: null,
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'users' => $users,
            'ApiReferenceData' => function () use ($request): array {
                return ApiReferenceData::rememberForSession($request);
            },
            'departments' => function () use ($request): array {
                return TourFormData::rememberForSession($request)['departments'] ?? [];
            },
            'gtcReps' => function () use ($request): array {
                return TourFormData::rememberForSession($request)['gtcReps'] ?? [];
            },
            'voiceOvers' => function () use ($request): array {
                return TourFormData::rememberForSession($request)['voiceOvers'] ?? [];
            },
            'demoUsers' => $request->user() || $bffAuthenticated
                ? array_map(
                    fn (mixed $u) => is_array($u)
                        ? ApiUserForInertia::forDemoCatalogRow($u)
                        : [],
                    DemoCatalog::users(),
                )
                : [],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'new_organisation' => fn () => $request->session()->get('new_organisation'),
                'created_order_item' => fn () => $request->session()->get('created_order_item'),
                'created_order' => fn () => $request->session()->get('created_order'),
                'submitted_order' => fn () => $request->session()->get('submitted_order'),
            ],
        ]);
    }

    /**
     * @return list<mixed>
     */
    private static function sessionStringList(mixed $value): array
    {
        if (is_array($value)) {
            return array_values($value);
        }

        return [];
    }
}
