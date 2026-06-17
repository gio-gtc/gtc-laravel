<?php

namespace App\Support;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

final class BffAuthSession
{
    public const EXPIRED_MESSAGE = 'Your session has expired. Please sign in again.';

    /**
     * Clear BFF session auth state (API token and cached user payload).
     */
    public static function clear(Request $request): void
    {
        Auth::guard('web')->logout();

        $request->session()->forget(['api_token', 'user', 'roles', 'permissions']);

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }
    }
}
