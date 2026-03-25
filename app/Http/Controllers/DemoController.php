<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class DemoController extends Controller
{
    public function show(string $uuid): Response
    {
        $items = config('demos.items', []);

        if (! isset($items[$uuid])) {
            abort(404);
        }

        $demo = $items[$uuid];

        return Inertia::render('demo/show', [
            'uuid' => $uuid,
            'tourName' => $demo['tourName'],
            'venueName' => $demo['venueName'],
            'assets' => $demo['assets'],
        ]);
    }
}
