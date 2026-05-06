<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Support\DemoCatalog;
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

        $users = $request->user()
            ? User::query()
                ->get()
                ->map(fn (User $user) => array_merge($user->toArray(), ['company_id' => 0]))
                ->values()
                ->all()
            : [];

        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $sessionUser = $request->session()->get('user');
        $bffAuthenticated = $request->session()->has('api_token');

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => is_array($sessionUser)
                    ? $this->normalizeApiUserForFrontend($sessionUser)
                    : $sessionUser,
                'roles' => self::sessionStringList($request->session()->get('roles')),
                'permissions' => self::sessionStringList($request->session()->get('permissions')),
                'token' => $request->session()->get('api_token'),
            ],
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'users' => $users,
            'demoUsers' => $request->user() || $bffAuthenticated
                ? array_map(
                    fn (mixed $u) => is_array($u) ? $this->withFirstLastFromNameWhenMissing($u) : [],
                    DemoCatalog::users(),
                )
                : [],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ]);
    }

    /**
     * Ensure shared user matches the shape the React app expects (name, id, email, etc.).
     *
     * @param  array<string, mixed>  $raw
     * @return array<string, mixed>
     */
    private function normalizeApiUserForFrontend(array $raw): array
    {
        $first = $raw['first_name'] ?? null;
        $last = $raw['last_name'] ?? null;
        $fromParts = trim(implode(' ', array_filter([(string) $first, (string) $last])));
        $name = $raw['name'] ?? $raw['full_name'] ?? $raw['fullName'] ?? ($fromParts !== '' ? $fromParts : null);
        if ($name === null || $name === '') {
            $email = (string) ($raw['email'] ?? '');
            $name = $email !== '' ? explode('@', $email, 2)[0] : 'User';
        }

        $idRaw = $raw['id'] ?? $raw['user_id'] ?? null;
        $id = is_numeric($idRaw) ? (int) $idRaw : 0;

        $email = (string) ($raw['email'] ?? '');
        $avatar = $raw['avatar'] ?? $raw['profile_photo_url'] ?? $raw['photo'] ?? null;

        $merged = array_merge($raw, [
            'id' => $id,
            'name' => (string) $name,
            'email' => $email,
            'avatar' => $avatar,
            'email_verified_at' => $raw['email_verified_at'] ?? null,
            'company_id' => is_numeric($raw['company_id'] ?? null) ? (int) $raw['company_id'] : 0,
            'created_at' => (string) ($raw['created_at'] ?? ''),
            'updated_at' => (string) ($raw['updated_at'] ?? ''),
        ]);

        return $this->withFirstLastFromNameWhenMissing($merged);
    }

    /**
     * Ensures first_name / last_name exist for UI initials when only name is present.
     *
     * @param  array<string, mixed>  $user
     * @return array<string, mixed>
     */
    private function withFirstLastFromNameWhenMissing(array $user): array
    {
        $mergedFirst = trim((string) ($user['first_name'] ?? ''));
        $mergedLast = trim((string) ($user['last_name'] ?? ''));
        if ($mergedFirst !== '' || $mergedLast !== '') {
            return $user;
        }

        $tokens = preg_split('/\s+/u', trim((string) ($user['name'] ?? '')), -1, PREG_SPLIT_NO_EMPTY) ?: [];
        if (count($tokens) === 1) {
            return array_merge($user, ['first_name' => $tokens[0], 'last_name' => '']);
        }
        if (count($tokens) >= 2) {
            return array_merge($user, [
                'first_name' => $tokens[0],
                'last_name' => implode(' ', array_slice($tokens, 1)),
            ]);
        }

        return $user;
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
