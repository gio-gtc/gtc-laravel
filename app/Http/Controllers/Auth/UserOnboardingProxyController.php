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
