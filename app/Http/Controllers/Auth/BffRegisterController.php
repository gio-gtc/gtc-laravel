<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class BffRegisterController extends Controller
{
    public function create()
    {
        return Inertia::render('auth/register'); 
    }

    public function store(Request $request)
    {
        // 1. Forward the data to the API Brain
        $response = Http::acceptJson()->post(config('services.api.base_url') . '/api/register', [
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => $request->password,
            'password_confirmation' => $request->password_confirmation,
        ]);

        // 2. If the API rejects it (e.g., email already exists, password too short)
        if ($response->failed()) {
            throw ValidationException::withMessages($response->json('errors', [
                'email' => 'Something went wrong during registration. Please try again.'
            ]));
        }

        // 3. Grab the successful JSON response from the API
        $data = $response->json();

        // 4. Save the API Token and User Data to the frontend session
        session([
            'api_token' => $data['access_token'],
            'user' => $data['user'],
            'roles' => $data['roles'],
            'permissions' => $data['permissions']
        ]);

        // 5. Regenerate the session ID for security
        $request->session()->regenerate();

        // 6. Redirect to the React dashboard
        return redirect()->route('dashboard');
    }
}