<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class DemoController extends Controller
{
    public function show(string $uuid, ?string $assetId = null): Response
    {
        $items = config('mockdata.demos.items', []);

        if (! isset($items[$uuid])) {
            abort(404);
        }

        $demo = $items[$uuid];
        $assets = $demo['assets'];
        $initialAssetId = $this->resolveInitialAssetId($assets, $assetId);

        return Inertia::render('demo/show', [
            'uuid' => $uuid,
            'tourName' => $demo['tourName'],
            'venueName' => $demo['venueName'],
            'assets' => $assets,
            'initialAssetId' => $initialAssetId,
        ]);
    }

    /**
     * @param  array<int, array<string, mixed>>  $assets
     */
    private function resolveInitialAssetId(array $assets, ?string $assetId): string
    {
        if ($assetId !== null) {
            foreach ($assets as $a) {
                if (($a['id'] ?? '') === $assetId) {
                    return $assetId;
                }
            }

            abort(404);
        }

        if ($assets === []) {
            return '';
        }

        $firstTab = $assets[0]['tab'] ?? 'broadcast';
        foreach ($assets as $a) {
            if (($a['tab'] ?? '') === $firstTab) {
                return (string) ($a['id'] ?? '');
            }
        }

        return (string) ($assets[0]['id'] ?? '');
    }
}
