<?php

namespace App\Http\Controllers;

use App\Support\BffAuthSession;
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
                ->with('error', BffAuthSession::EXPIRED_MESSAGE);
        }

        $baseUrl = rtrim((string) config('services.api.base_url'), '/');
        $response = Http::withToken($token)
            ->acceptJson()
            ->post($baseUrl.'/api/organisations', $request->all());

        if ($response->successful()) {
            $decoded = $response->json();
            $decodedArray = is_array($decoded) ? $decoded : [];
            $newOrg = self::extractCreatedOrganisation($decodedArray);

            if ($newOrg !== null) {
                return redirect()->back()->with([
                    'success' => 'Organisation created',
                    'new_organisation' => $newOrg,
                ]);
            }

            return redirect()->back()->with(
                'success',
                'Organisation created successfully.',
            );
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

    /**
     * @param  array<string, mixed>  $decoded
     * @return array{id: int, name: string}|null
     */
    private static function extractCreatedOrganisation(array $decoded): ?array
    {
        $candidate = null;
        if (isset($decoded['organisation']) && is_array($decoded['organisation'])) {
            $candidate = $decoded['organisation'];
        } elseif (isset($decoded['id'], $decoded['name'])) {
            $candidate = $decoded;
        }

        if (! is_array($candidate)) {
            return null;
        }

        $idRaw = $candidate['id'] ?? null;
        $nameRaw = $candidate['name'] ?? null;
        $id = is_numeric($idRaw) ? (int) $idRaw : null;
        $name = is_string($nameRaw) ? trim($nameRaw) : '';

        if ($id === null || $id <= 0 || $name === '') {
            return null;
        }

        return ['id' => $id, 'name' => $name];
    }
}
