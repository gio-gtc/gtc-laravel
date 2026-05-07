<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class UserOnboardingProxyController extends Controller
{
    public function invite(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'organisation' => 'required|string|max:255',
        ]);

        $apiUrl = config('services.api.base_url').'/api/users/invite';

        $response = Http::withToken($request->session()->get('api_token'))
            ->acceptJson()
            ->post($apiUrl, $validated);

        

        if ($response->status() === 422) {
            $errors = $response->json('errors');
        
            // If the API complained specifically about the email, flash the error toast
            if (isset($errors['email'])) {
                return back()->with('error', 'A user with this email already exists.');
            }
            
            // If it's a different validation error, pass it back to the form
            throw \Illuminate\Validation\ValidationException::withMessages($errors);
        }

        if ($response->status() === 401) {
            return back()->with('error', 'API Authentication failed. Please log in again.');
        }

        if ($response->successful()) {
            return back()->with('success', 'User invited successfully.');
        }

        dd([
            'status' => $response->status(),
            'error_body' => $response->json() ?? $response->body()
        ]);

        throw ValidationException::withMessages([
            'email' => ['Unable to send the invitation right now. Please try again later.'],
        ]);
    }

    public function showSetPassword(Request $request): Response|RedirectResponse
    {
        $token = $request->query('token');
        $email = $request->query('email');

        if (empty($token) || empty($email)) {
            return redirect()->route('login')->with('error', 'Invalid or missing setup link');
        }

        return Inertia::render('auth/set-password', [
            'token' => (string) $token,
            'email' => (string) $email,
        ]);
    }

    public function setPassword(Request $request): RedirectResponse
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|confirmed|min:8',
        ]);

        $apiUrl = config('services.api.base_url').'/api/users/set-password';

        $response = Http::acceptJson()->post($apiUrl, [
            'token' => $request->token,
            'email' => $request->email,
            'password' => $request->password,
            'password_confirmation' => $request->password_confirmation,
        ]);

        if ($response->successful()) {
            return redirect()->route('login')->with('success', 'Your password has been set. You can log in now.');
        }

        if ($response->status() === 422) {
            $this->throwValidationFromApiErrors($response->json('errors', []));
        }

        $message = $response->json('message');
        if (! is_string($message) || $message === '') {
            $message = 'This setup link is invalid or has expired. Please request a new invitation.';
        }

        return redirect()->route('set-password.show', [
            'email' => $request->email,
            'token' => $request->token,
        ])->with('error', $message);
    }

    /**
     * @param  array<string, mixed>  $errors
     */
    private function throwValidationFromApiErrors(array $errors): void
    {
        if ($errors === []) {
            throw ValidationException::withMessages([
                'email' => ['The given data was invalid.'],
            ]);
        }

        $normalized = [];
        foreach ($errors as $key => $messages) {
            $normalized[$key] = is_array($messages) ? $messages : [$messages];
        }

        throw ValidationException::withMessages($normalized);
    }
}
