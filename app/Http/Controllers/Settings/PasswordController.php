<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class PasswordController extends Controller
{
    /**
     * Forward the password update to the gtc-api as a thin BFF proxy.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required', 'string'],
        ]);

        $apiUrl = config('services.api.base_url').'/api/password';

        $response = Http::withToken($request->session()->get('api_token'))
            ->acceptJson()
            ->put($apiUrl, $validated);

        if ($response->successful()) {
            $apiMessage = $response->json('message');

            return back()->with(
                'success',
                is_string($apiMessage) && $apiMessage !== '' ? $apiMessage : 'Password updated successfully.',
            );
        }

        if ($response->status() === 422) {
            throw ValidationException::withMessages(
                collect($response->json('errors', []))
                    ->map(fn ($messages) => is_array($messages) ? $messages : [$messages])
                    ->all()
            );
        }

        $message = $response->json('message');

        return back()->with(
            'error',
            is_string($message) && $message !== '' ? $message : 'Unable to update password.'
        );
    }
}
