<?php

namespace App\Http\Controllers;

use App\Support\BffAuthSession;
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
                ->with('error', BffAuthSession::EXPIRED_MESSAGE);
        }

        $isStaff = self::sessionUserIsStaff($request);
        $validated = $request->validate(self::rules($isStaff));

        $sessionUserId = self::sessionUserId($request);
        if (! $isStaff && $sessionUserId === null) {
            return redirect()
                ->route('login')
                ->with('error', BffAuthSession::EXPIRED_MESSAGE);
        }

        $apiPayload = self::mapApiPayload($validated, $isStaff, $sessionUserId);

        $result = $client->post('/api/orders', $apiPayload);

        if ($result['ok']) {
            $redirect = redirect()
                ->route('orders')
                ->with('success', 'Order created successfully.');

            $created = self::extractCreatedOrder(
                $result['data'],
                (int) $validated['tour_id'],
            );
            if ($created !== null) {
                $redirect->with('created_order', $created);
            }

            return $redirect;
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
            'show_dates' => ['required', 'array', 'min:1'],
            'show_dates.*' => ['required', 'date'],
            'local_deliverable_email' => ['nullable', 'email'],
        ];

        if ($isStaff) {
            $rules['ordered_by_id'] = ['required', 'integer', 'min:1'];
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
        $showDateStrings = self::normalizeShowDates($validated['show_dates']);

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
            'show_dates' => array_map(
                static fn (string $showDate) => ['show_date' => $showDate],
                $showDateStrings,
            ),
        ];
    }

    /**
     * @param  array<int, mixed>  $showDates
     * @return list<string>
     */
    private static function normalizeShowDates(array $showDates): array
    {
        $unique = [];

        foreach ($showDates as $showDate) {
            $showDateString = $showDate instanceof \DateTimeInterface
                ? $showDate->format('Y-m-d')
                : (string) $showDate;

            if ($showDateString !== '') {
                $unique[$showDateString] = $showDateString;
            }
        }

        ksort($unique);

        return array_values($unique);
    }

    private static function sessionUserIsStaff(Request $request): bool
    {
        $user = $request->session()->get('user');

        if (! is_array($user)) {
            return false;
        }

        $orgId = self::sessionUserOrganisationId($user);

        return $orgId !== null && $orgId === self::GTC_STAFF_ORGANISATION_ID;
    }

    /**
     * @param  array<string, mixed>  $user
     */
    private static function sessionUserOrganisationId(array $user): ?int
    {
        $organisation = $user['organisation'] ?? null;
        if (is_array($organisation)) {
            $nestedId = $organisation['id'] ?? null;
            if (is_numeric($nestedId)) {
                return (int) $nestedId;
            }
        }

        $orgId = $user['organisation_id'] ?? null;

        return is_numeric($orgId) ? (int) $orgId : null;
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
    /**
     * @param  array<string, mixed>  $data
     * @return array{id: int, tour_id: int}|null
     */
    private static function extractCreatedOrder(array $data, int $tourId): ?array
    {
        $candidates = [
            $data['order'] ?? null,
            $data,
        ];

        foreach ($candidates as $order) {
            if (! is_array($order)) {
                continue;
            }

            $id = $order['id'] ?? null;
            if (! is_numeric($id)) {
                continue;
            }

            $resolvedTourId = $order['tour_id'] ?? $tourId;

            return [
                'id' => (int) $id,
                'tour_id' => is_numeric($resolvedTourId) ? (int) $resolvedTourId : $tourId,
            ];
        }

        return null;
    }

    private function throwValidationFromApiErrors(array $errors): void
    {
        if ($errors === []) {
            throw ValidationException::withMessages([
                'venue_id' => ['The given data was invalid.'],
            ]);
        }

        $normalized = [];
        foreach ($errors as $key => $messages) {
            $field = (string) $key;
            if ($field === 'show_dates' || str_starts_with($field, 'show_dates.')) {
                $field = 'show_dates';
            }

            $msgList = is_array($messages) ? $messages : [$messages];

            if (isset($normalized[$field])) {
                $normalized[$field] = array_merge($normalized[$field], $msgList);
            } else {
                $normalized[$field] = $msgList;
            }
        }

        throw ValidationException::withMessages($normalized);
    }
}
