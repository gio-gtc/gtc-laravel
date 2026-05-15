<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class OrganisationController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $token = $request->session()->get('api_token');

        if (! is_string($token) || $token === '') {
            return redirect()
                ->route('login')
                ->with('error', 'Your session has expired. Please sign in again.');
        }

        $baseUrl = rtrim((string) config('services.api.base_url'), '/');
        $response = Http::withToken($token)
            ->acceptJson()
            ->post($baseUrl.'/api/organisations', $request->all());

        if ($response->successful()) {
            return redirect()->back()->with('success', 'Organisation created successfully.');
        }

        if ($response->status() === 422) {
            $this->throwValidationFromApiErrors($response->json('errors', []));
        }

        $message = $response->json('message');

        return redirect()->back()->with(
            'error',
            is_string($message) && $message !== ''
                ? $message
                : 'Could not create the organisation right now. Please try again.',
        );
    }

    /**
     * @param  array<string, mixed>  $errors
     */
    private function throwValidationFromApiErrors(array $errors): void
    {
        if ($errors === []) {
            throw ValidationException::withMessages([
                'name' => ['The given data was invalid.'],
            ]);
        }

        $normalized = [];
        foreach ($errors as $key => $messages) {
            $normalized[$key] = is_array($messages) ? $messages : [$messages];
        }

        throw ValidationException::withMessages($normalized);
    }
}
