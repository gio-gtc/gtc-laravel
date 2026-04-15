<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class DemoController extends Controller
{
    private const ALLOWED_ART_PACKAGE_TYPES = [
        'Key Art Package',
        'Socials & Web Banners',
        'International Key art & Social Package',
    ];

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
     * Display label for venue line items: broadcast/radio/social use `spot_type` + space + `cut` (same as TS `venueItemMediaLineLabel`).
     * Social rows may include `card_holder` (Amex, Citi). Art rows use `package_type` + `label`.
     *
     * @param  array<string, mixed>  $row
     */
    private function venueItemDisplayLabel(array $row): string
    {
        $lineType = (string) ($row['type'] ?? '');
        if (in_array($lineType, ['broadcast', 'radio', 'social'], true)) {
            $spotType = (string) ($row['spot_type'] ?? '');
            $cut = (string) ($row['cut'] ?? '');
            $base = $spotType.' '.$cut;
            if ($lineType === 'social' && isset($row['card_holder']) && $row['card_holder'] !== '') {
                return $base.' · '.(string) $row['card_holder'];
            }

            return $base;
        }

        if ($lineType === 'art') {
            $pkg = $this->normalizeArtPackageType($row['package_type'] ?? null);
            $label = $this->normalizeArtLabel($pkg, $row['label'] ?? null);
            if ($pkg !== '') {
                return $pkg.($label !== '' ? ' — '.$label : '');
            }

            return $label;
        }

        return (string) ($row['label'] ?? '');
    }

    private function normalizeArtPackageType(mixed $packageType): string
    {
        $pkg = is_string($packageType) ? trim($packageType) : '';
        if (in_array($pkg, self::ALLOWED_ART_PACKAGE_TYPES, true)) {
            return $pkg;
        }

        return self::ALLOWED_ART_PACKAGE_TYPES[0];
    }

    private function normalizeArtLabel(string $normalizedPackageType, mixed $label): string
    {
        $value = is_string($label) ? trim($label) : '';

        if ($value === '') {
            return $normalizedPackageType;
        }

        if ($value === 'Key Art') {
            return 'Key Art Package';
        }

        if (in_array($value, self::ALLOWED_ART_PACKAGE_TYPES, true)) {
            return $value;
        }

        return $normalizedPackageType;
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
            'label' => $this->venueItemDisplayLabel($row),
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
