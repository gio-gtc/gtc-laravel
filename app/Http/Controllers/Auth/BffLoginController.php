<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class BffLoginController extends Controller
{
    /**
     * Show the React Login Page
     */
    public function create(Request $request)
    {
        $authFaceHint = $request->session()->pull('auth_face');

        $status = $request->session()->pull('status');
        $successBanner = $request->session()->pull('success');
        $error = $request->session()->pull('error');

        return Inertia::render('auth/login', [
            'authFaceHint' => $authFaceHint === 'signup' ? 'signup' : null,
            'status' => $status ?? $successBanner,
            'error' => $error,
        ]);
    }

    /**
     * Handle the Login Attempt
     */
    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $response = Http::acceptJson()->post(config('services.api.base_url').'/api/login', [
            'email' => $request->email,
            'password' => $request->password,
        ]);

        if ($response->failed()) {
            throw ValidationException::withMessages([
                'email' => 'These credentials do not match our records.',
            ]);
        }

        $data = $response->json();

        session([
            'api_token' => $data['access_token'],
            'user' => $data['user'],
            'roles' => $data['roles'],
            'permissions' => $data['permissions'],
        ]);

        $request->session()->regenerate();

        return redirect($this->landingRouteFor($data['roles'] ?? []));
    }

    /**
     * Pick the post-login landing URL based on the API-supplied roles.
     *
     * @param  array<int, string>  $roles
     */
    private function landingRouteFor(array $roles): string
    {
        if (in_array('Super Admin', $roles, true)) {
            return route('dashboard');
        }

        if (in_array('Client', $roles, true)) {
            return route('orders');
        }

        return route('orders', ['filter' => 'my-tasks']);
    }
}
