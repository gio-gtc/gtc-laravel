<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class BffForgotPasswordController extends Controller
{
    /**
     * Display the password reset link request React view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            // This allows us to pass a success message to React when the email sends
            'status' => session('status'),
        ]);
    }

    /**
     * Proxy the password reset link request to the API.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        // Forward the request to gtc-api
        $response = Http::post(env('API_BASE_URL', 'http://127.0.0.1:8050') . '/api/forgot-password', [
            'email' => $request->email,
        ]);

        // If the API says success, redirect back with a session status 
        // that Inertia can display as a green success banner
        if ($response->successful()) {
            return back()->with('status', $response->json('message'));
        }

        // If the API rejects it (e.g., email not found in AWS database),
        // catch the 422 error and pipe it back into the Inertia form error bag
        if ($response->status() === 422) {
            throw ValidationException::withMessages([
                'email' => $response->json('errors.email') ?? ['We could not find a user with that email address.'],
            ]);
        }

        // Catch-all for API downtime (500 errors)
        throw ValidationException::withMessages([
            'email' => ['The authentication service is currently unavailable. Please try again later.'],
        ]);
    }
}