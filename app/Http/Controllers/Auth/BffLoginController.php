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
    public function create()
    {
        // Make sure the casing matches your folder structure exactly!
        return Inertia::render('auth/login');
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

        $apiBase = rtrim((string) config('services.api.base_url'), '/');
        $loginPath = trim((string) config('services.api.login_path', 'api/login'), '/');
        $loginUrl = $apiBase.'/'.$loginPath;

        if ($apiBase === '') {
            throw ValidationException::withMessages([
                'email' => 'Login service is not configured. Set API_BASE_URL in your .env file (see .env.example).',
            ]);
        }

        $response = Http::acceptJson()->post($loginUrl, [
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

        return redirect()->route('dashboard');
    }
}
