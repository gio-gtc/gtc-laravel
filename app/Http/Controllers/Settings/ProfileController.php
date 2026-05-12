<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     *
     * When the API redirects back with ?email_verified=true after the user
     * confirms a new email, translate that into a flash + dashboard redirect
     * so the toast surfaces on a page that actually exists in React.
     */
    public function edit(Request $request): Response|RedirectResponse
    {
        if ($request->boolean('email_verified')) {
            return redirect()
                ->route('dashboard')
                ->with('success', 'Your email has been successfully updated!');
        }

        return Inertia::render('settings/profile');
    }

    /**
     * Forward the profile update to the gtc-api as a thin BFF proxy.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'phone_number' => ['required', 'string', 'regex:/^\+[1-9]\d{7,14}$/', 'max:50'],
            'job_title' => ['nullable', 'string', 'max:255'],
            'organisation_id' => ['nullable', 'integer'],
            'department' => ['nullable', 'string', 'max:255'],
        ]);

        $apiUrl = config('services.api.base_url').'/api/profile';

        $response = Http::withToken($request->session()->get('api_token'))
            ->acceptJson()
            ->put($apiUrl, $validated);

        if ($response->successful()) {
            $user = $response->json('user');

            if (is_array($user)) {
                $request->session()->put('user', $user);
            }

            $apiMessage = $response->json('message');

            return back()->with(
                'success',
                is_string($apiMessage) && $apiMessage !== '' ? $apiMessage : 'Profile updated.',
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
            is_string($message) && $message !== '' ? $message : 'Unable to update profile.'
        );
    }
}
