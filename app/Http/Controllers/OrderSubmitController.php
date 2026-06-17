<?php

namespace App\Http\Controllers;

use App\Support\BffAuthSession;
use App\Support\GtcApiClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

final class OrderSubmitController extends Controller
{
    public function __invoke(Request $request, int $order): RedirectResponse
    {
        $client = GtcApiClient::fromRequest($request);

        if ($client === null) {
            return redirect()
                ->route('login')
                ->with('error', BffAuthSession::EXPIRED_MESSAGE);
        }

        $result = $client->post("/api/orders/{$order}/submit", []);

        if ($result['ok']) {
            $redirect = redirect()
                ->route('orders')
                ->with('success', 'Order submitted successfully.');

            $submitted = self::extractSubmittedOrder($result['data'], $order);
            if ($submitted !== null) {
                $redirect->with('submitted_order', $submitted);
            }

            return $redirect;
        }

        if ($result['status'] === 409) {
            return redirect()
                ->route('orders')
                ->with('error', $result['message']);
        }

        return redirect()
            ->route('orders')
            ->with('error', $result['message']);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array{id: int, tour_id?: int}|null
     */
    private static function extractSubmittedOrder(array $data, int $orderId): ?array
    {
        $candidates = [
            $data['order'] ?? null,
            $data['data']['order'] ?? null,
            $data['data'] ?? null,
            $data,
        ];

        foreach ($candidates as $order) {
            if (! is_array($order)) {
                continue;
            }

            $id = $order['id'] ?? $orderId;
            if (! is_numeric($id)) {
                continue;
            }

            $payload = ['id' => (int) $id];
            $tourId = $order['tour_id'] ?? null;
            if (is_numeric($tourId)) {
                $payload['tour_id'] = (int) $tourId;
            }

            return $payload;
        }

        return ['id' => $orderId];
    }
}
