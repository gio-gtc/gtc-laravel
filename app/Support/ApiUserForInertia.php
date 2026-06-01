<?php

namespace App\Support;

/**
 * Normalizes API session user arrays into the shape expected by the React app.
 */
final class ApiUserForInertia
{
    /**
     * @param  array<string, mixed>  $raw
     * @return array<string, mixed>
     */
    public static function normalize(array $raw): array
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
        ]);

        return self::withFirstLastFromNameWhenMissing($merged);
    }

    /**
     * Lightweight tweak for DemoCatalog JSON users (not full API normalization).
     *
     * @param  array<string, mixed>  $user
     * @return array<string, mixed>
     */
    public static function forDemoCatalogRow(array $user): array
    {
        return self::withFirstLastFromNameWhenMissing($user);
    }

    /**
     * Display label for the user's organisation (nested relation or flat field from API).
     *
     * @param  array<string, mixed>  $raw
     */
    private static function organisationDisplayName(array $raw): ?string
    {
        $flat = $raw['organisation_name'] ?? null;
        if (is_string($flat)) {
            $trimmed = trim($flat);

            return $trimmed !== '' ? $trimmed : null;
        }

        $organisation = $raw['organisation'] ?? null;
        if (is_array($organisation)) {
            $fromNested = $organisation['name'] ?? null;
            if (is_string($fromNested)) {
                $trimmed = trim($fromNested);

                return $trimmed !== '' ? $trimmed : null;
            }
        }

        return null;
    }

    /**
     * Ensures first_name / last_name exist for UI initials when only name is present.
     *
     * @param  array<string, mixed>  $user
     * @return array<string, mixed>
     */
    private static function withFirstLastFromNameWhenMissing(array $user): array
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
}
