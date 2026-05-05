<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class BffResetPasswordController extends Controller
{
    /**
     * Display the password reset React view.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/reset-password', [
            'email' => $request->email,
            'token' => $request->token,
        ]);
    }

    /**
     * Proxy the new password submission to the API.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'token'    => 'required',
            'email'    => 'required|email',
            'password' => 'required|confirmed|min:8',
        ]);

        // Safely format the API URL 
        $apiUrl = config('services.api.base_url') . '/api/reset-password';

        // Forward the request to gtc-api
        $response = Http::post($apiUrl, [
            'token'                 => $request->token,
            'email'                 => $request->email,
            'password'              => $request->password,
            'password_confirmation' => $request->password_confirmation,
        ]);

        // If the API successfully hashed the new password
        if ($response->successful()) {
            // Redirect them to the login page with a green success banner!
            return redirect()->route('login')->with('status', $response->json('message'));
        }

        // If the API rejects it (e.g., token expired, password too weak)
        if ($response->status() === 422) {
            throw ValidationException::withMessages([
                'email'    => $response->json('errors.email') ?? [],
                'password' => $response->json('errors.password') ?? [],
            ]);
        }

        // Catch-all for API downtime
        throw ValidationException::withMessages([
            'email' => ['The authentication service is currently unavailable. Please try again later.'],
        ]);
    }
}