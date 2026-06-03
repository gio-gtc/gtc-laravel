<?php

namespace App\Http\Controllers;

use App\Support\GtcApiClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

final class OrderItemStoreController extends Controller
{
    public function __invoke(Request $request, int $order): RedirectResponse
    {
        $client = GtcApiClient::fromRequest($request);

        if ($client === null) {
            return redirect()
                ->route('login')
                ->with('error', 'Your session has expired. Please sign in again.');
        }

        $validated = $request->validate([
            'order_menu_item_id' => ['required', 'integer', 'min:1'],
            'due_date' => ['required', 'date'],
            'specifications' => ['required', 'array'],
            'assignee_ids' => ['sometimes', 'array'],
            'assignee_ids.*' => ['integer', 'min:1'],
        ]);

        $payload = [
            'order_menu_item_id' => (int) $validated['order_menu_item_id'],
            'due_date' => $validated['due_date'] instanceof \DateTimeInterface
                ? $validated['due_date']->format('Y-m-d')
                : (string) $validated['due_date'],
            'specifications' => $validated['specifications'],
        ];

        if (isset($validated['assignee_ids'])) {
            $payload['assignee_ids'] = array_map('intval', $validated['assignee_ids']);
        }

        $result = $client->post("/api/orders/{$order}/items", $payload);

        if ($result['ok']) {
            $created = self::extractOrderItem($result['data']);

            return redirect()
                ->route('orders')
                ->with('success', 'Line item added successfully.')
                ->with('created_order_item', $created);
        }

        if ($result['status'] === 422) {
            $errors = $result['data']['errors'] ?? [];
            if (is_array($errors)) {
                throw ValidationException::withMessages($errors);
            }
        }

        return redirect()
            ->route('orders')
            ->with('error', $result['message']);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>|null
     */
    private static function extractOrderItem(array $data): ?array
    {
        $candidates = [
            $data['order_item'] ?? null,
            $data['data']['order_item'] ?? null,
            $data['data'] ?? null,
            $data,
        ];

        foreach ($candidates as $item) {
            if (is_array($item) && isset($item['id'], $item['order_id'])) {
                return $item;
            }
        }

        return null;
    }
}
