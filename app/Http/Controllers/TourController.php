<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class TourController extends Controller
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
            ->post($baseUrl.'/api/tours', self::mapStorePayload($request));

        if ($response->successful()) {
            return back()->with('success', 'Tour created successfully.');
        }

        if ($response->status() === 422) {
            $this->throwValidationFromApiErrors($response->json('errors', []));
        }

        $message = $response->json('message');

        return back()->with(
            'error',
            is_string($message) && $message !== ''
                ? $message
                : 'Could not create the tour right now. Please try again.',
        );
    }

    /**
     * Map Inertia form keys to gtc-api POST /api/tours field names.
     *
     * @return array<string, mixed>
     */
    private static function mapStorePayload(Request $request): array
    {
        $startDate = $request->input('start_date');
        $expireCuts = $request->input('expire_on_sale_now_cuts');
        $voiceOver = $request->input('voice_over');

        $payload = [
            'name' => $request->input('name'),
            'start_date' => $startDate,
            'expire_on_sale_now_cuts' => is_string($expireCuts) && $expireCuts !== ''
                ? $expireCuts
                : $startDate,
            'gtc_rep_id' => $request->input('gtc_representative'),
            'department_id' => $request->input('gtc_department'),
            'hold_all_invoices' => $request->boolean('hold_all_invoices'),
            'live_on_ordering_system' => $request->boolean('live_on_ordering_system'),
            'require_client_approval' => $request->boolean('require_client_approval'),
            'client_approval_email' => $request->input('client_approval_email'),
            'tour_sponsor' => $request->input('tour_sponsor'),
            'special_instructions' => $request->input('special_instructions'),
            'tv_first_cut' => $request->input('tv_first_cut'),
            'tv_second_cut' => $request->input('tv_second_cut'),
            'radio_single_duration' => $request->input('radio_single_duration'),
            'radio_dual_duration' => $request->input('radio_dual_duration'),
            'key_art' => $request->input('key_art'),
            'voice_over_id' => filled($voiceOver) ? $voiceOver : null,
        ];

        return $payload;
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
            if ($key === 'voice_over_id') {
                $key = 'voice_over';
            }
            $normalized[$key] = is_array($messages) ? $messages : [$messages];
        }

        throw ValidationException::withMessages($normalized);
    }
}
