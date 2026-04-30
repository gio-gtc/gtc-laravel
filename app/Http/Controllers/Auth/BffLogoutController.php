<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BffLogoutController extends Controller
{
    /**
     * Clear BFF session state (API token and cached user payload) and rotate the session.
     */
    public function destroy(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->forget(['api_token', 'user', 'roles', 'permissions']);

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return redirect()->route('login');
    }
}
