<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class DemoController extends Controller
{
    public function show(string $uuid, ?string $assetId = null): Response
    {
        $tourVenueId = $this->resolveTourVenueIdFromDemoUuid($uuid);
        if ($tourVenueId === null) {
            abort(404);
        }

        $tourId = $this->resolveTourIdForTourVenue($tourVenueId);
        if ($tourId === null) {
            abort(404);
        }

        $tourName = $this->resolveTourName($tourId);
        $venueName = 'Marketing collateral';

        $venueItems = config('mockdata.venue_items', []);
        $itemsForVenue = array_values(array_filter(
            $venueItems,
            static fn (array $row): bool => (int) ($row['tour_venue_id'] ?? 0) === $tourVenueId
        ));

        $assets = array_map(fn (array $row): array => $this->venueItemToDemoAsset($row), $itemsForVenue);

        $initialAssetId = $this->resolveInitialAssetId($assets, $assetId);

        return Inertia::render('demo/show', [
            'uuid' => $uuid,
            'tourName' => $tourName,
            'venueName' => $venueName,
            'assets' => $assets,
            'initialAssetId' => $initialAssetId,
        ]);
    }

    private function resolveTourIdForTourVenue(int $tourVenueId): ?int
    {
        foreach (['tour_venue_demos', 'tour_venue_stops', 'tour_venues'] as $key) {
            $rows = config('mockdata.'.$key, []);
            foreach ($rows as $row) {
                if ((int) ($row['id'] ?? 0) === $tourVenueId) {
                    return isset($row['tour_id']) ? (int) $row['tour_id'] : null;
                }
            }
        }

        return null;
    }

    private function resolveTourName(int $tourId): string
    {
        $tours = config('mockdata.tours', []);
        foreach ($tours as $tour) {
            if ((int) ($tour['id'] ?? 0) === $tourId) {
                return (string) ($tour['name'] ?? 'Tour');
            }
        }

        return 'Tour';
    }

    /**
     * @param  array<string, mixed>  $row
     * @return array<string, mixed>
     */
    private function venueItemToDemoAsset(array $row): array
    {
        $type = (string) ($row['type'] ?? 'broadcast');
        $tab = $type;
        $durationSeconds = (int) ($row['duration_seconds'] ?? 0);
        if ($type === 'art') {
            $durationSeconds = 0;
        }

        return [
            'id' => (string) ($row['id'] ?? ''),
            'tab' => $tab,
            'label' => (string) ($row['label'] ?? ''),
            'duration_seconds' => $durationSeconds,
            'thumbnailUrl' => (string) ($row['thumbnailUrl'] ?? ''),
            'mediaUrl' => (string) ($row['mediaUrl'] ?? ''),
            'kind' => (string) ($row['kind'] ?? 'video'),
        ];
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

    /**
     * Match URL segment to {@see tour_venue_demos} row via `demo_uuid`.
     */
    private function resolveTourVenueIdFromDemoUuid(string $uuid): ?int
    {
        $demos = config('mockdata.tour_venue_demos', []);
        foreach ($demos as $row) {
            if (($row['demo_uuid'] ?? null) === $uuid) {
                return (int) ($row['id'] ?? 0) ?: null;
            }
        }

        return null;
    }
}
