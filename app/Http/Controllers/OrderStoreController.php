<?php

namespace App\Http\Controllers;

use App\Support\GtcApiClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

final class OrderStoreController extends Controller
{
    private const GTC_STAFF_ORGANISATION_ID = 1;

    public function __invoke(Request $request): RedirectResponse
    {
        $client = GtcApiClient::fromRequest($request);

        if ($client === null) {
            return redirect()
                ->route('login')
                ->with('error', 'Your session has expired. Please sign in again.');
        }

        $isStaff = self::sessionUserIsStaff($request);
        $validated = $request->validate(self::rules($isStaff));

        $sessionUserId = self::sessionUserId($request);
        if (! $isStaff && $sessionUserId === null) {
            return redirect()
                ->route('login')
                ->with('error', 'Your session has expired. Please sign in again.');
        }

        $result = $client->post('/api/orders', self::mapApiPayload($validated, $isStaff, $sessionUserId));

        if ($result['ok']) {
            return redirect()
                ->route('orders')
                ->with('success', 'Order created successfully.');
        }

        if ($result['status'] === 422) {
            $errors = $result['data']['errors'] ?? [];
            if (is_array($errors)) {
                $this->throwValidationFromApiErrors($errors);
            }
        }

        return redirect()
            ->route('orders')
            ->with('error', $result['message']);
    }

    /**
     * @return array<string, mixed>
     */
    private static function rules(bool $isStaff): array
    {
        $rules = [
            'tour_id' => ['required', 'integer'],
            'venue_id' => ['required', 'integer'],
            'due_date' => ['required', 'date'],
            'show_date' => ['required', 'date'],
            'local_deliverable_email' => ['nullable', 'email'],
        ];

        if ($isStaff) {
            $rules['ordered_by_id'] = ['required', 'integer'];
        } else {
            $rules['ordered_by_id'] = ['prohibited'];
        }

        return $rules;
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private static function mapApiPayload(array $validated, bool $isStaff, ?int $sessionUserId): array
    {
        $showDate = $validated['show_date'];
        $showDateString = $showDate instanceof \DateTimeInterface
            ? $showDate->format('Y-m-d')
            : (string) $showDate;

        $dueDate = $validated['due_date'];
        $dueDateString = $dueDate instanceof \DateTimeInterface
            ? $dueDate->format('Y-m-d')
            : (string) $dueDate;

        $email = $validated['local_deliverable_email'] ?? null;

        return [
            'tour_id' => (int) $validated['tour_id'],
            'is_demo' => false,
            'venue_id' => (int) $validated['venue_id'],
            'ordered_by_id' => $isStaff
                ? (int) $validated['ordered_by_id']
                : (int) $sessionUserId,
            'local_deliverable_email' => is_string($email) && $email !== '' ? $email : null,
            'due_date' => $dueDateString,
            'show_dates' => [
                ['show_date' => $showDateString],
            ],
        ];
    }

    private static function sessionUserIsStaff(Request $request): bool
    {
        $user = $request->session()->get('user');

        if (! is_array($user)) {
            return false;
        }

        $orgId = $user['organisation_id'] ?? null;

        return is_numeric($orgId) && (int) $orgId === self::GTC_STAFF_ORGANISATION_ID;
    }

    private static function sessionUserId(Request $request): ?int
    {
        $user = $request->session()->get('user');

        if (! is_array($user)) {
            return null;
        }

        $id = $user['id'] ?? null;

        return is_numeric($id) ? (int) $id : null;
    }

    /**
     * @param  array<string, mixed>  $errors
     */
    private function throwValidationFromApiErrors(array $errors): void
    {
        if ($errors === []) {
            throw ValidationException::withMessages([
                'venue_id' => ['The given data was invalid.'],
            ]);
        }

        $normalized = [];
        foreach ($errors as $key => $messages) {
            if ($key === 'show_dates' || $key === 'show_dates.0.show_date') {
                $key = 'show_date';
            }
            $normalized[$key] = is_array($messages) ? $messages : [$messages];
        }

        throw ValidationException::withMessages($normalized);
    }
}
