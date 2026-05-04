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

        $response = Http::acceptJson()->post(config('services.api.base_url') . '/api/login', [
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
