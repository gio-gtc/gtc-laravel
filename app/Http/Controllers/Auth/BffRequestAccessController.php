<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class BffRequestAccessController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'company' => 'required|string|max:255',
            'job_title' => 'required|string|max:255',
            'phone' => 'required|string|max:50',
            'details' => 'required|string|max:10000',
        ]);

        $base = config('services.api.base_url');
        $path = ltrim(config('services.api.request_access_path'), '/');

        $response = Http::acceptJson()->post("{$base}/{$path}", $validated);

        if ($response->successful()) {
            return redirect()->route('login');
        }

        if ($response->status() === 422) {
            $errors = $response->json('errors', []);

            if (! is_array($errors) || $errors === []) {
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

        throw ValidationException::withMessages([
            'email' => ['Unable to submit your request right now. Please try again later.'],
        ]);
    }
}
