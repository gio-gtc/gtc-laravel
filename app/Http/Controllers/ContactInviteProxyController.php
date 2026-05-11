<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class ContactInviteProxyController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $apiUrl = config('services.api.base_url') . '/api/users/invite';
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'organisation' => 'required|string|max:255',
            'job_title' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'phone_number' => ['required', 'string', 'regex:/^\+[1-9]\d{7,14}$/', 'max:50'],
            'about_me' => 'nullable|string|max:2000',
            'permissions_level' => 'nullable|string|max:255',
        ]);

        $response = Http::withToken($request->session()->get('api_token'))
            ->acceptJson()
            ->post($apiUrl, $validated);

        if ($response->successful()) {
            return back()->with('success', 'Contact invitation email sent.');
        }

        if ($response->status() === 422) {
            $this->throwValidationFromApiErrors($response->json('errors', []));
        }

        if ($response->status() === 409) {
            $msg = $response->json('message');
            throw ValidationException::withMessages([
                'email' => [is_string($msg) && $msg !== '' ? $msg : 'This contact already exists in the system.'],
            ]);
        }

        dd([
            'status' => $response->status(),
            'error_body' => $response->json() ?? $response->body()
        ]);

        throw ValidationException::withMessages([
            'email' => ['Unable to send the invitation right now. Please try again later.'],
        ]);
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
