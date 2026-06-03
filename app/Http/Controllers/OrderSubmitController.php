<?php

namespace App\Http\Controllers;

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
                ->with('error', 'Your session has expired. Please sign in again.');
        }

        $result = $client->post("/api/orders/{$order}/submit", []);

        if ($result['ok']) {
            return redirect()
                ->route('orders')
                ->with('success', 'Order submitted successfully.');
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
}
