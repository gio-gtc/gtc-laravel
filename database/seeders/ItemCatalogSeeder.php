<?php

namespace Database\Seeders;

use App\Models\ItemCatalog;
use Illuminate\Database\Seeder;

class ItemCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['social.admat.fb_feed', 'Facebook Feed Admat', 'social_admat', 1200, 630],
            ['social.admat.ig_story', 'Instagram Story Admat', 'social_admat', 1080, 1920],
            ['social.admat.ig_square', 'Instagram Square Admat', 'social_admat', 1080, 1080],
            ['social.admat.tw_post', 'Twitter Post Admat', 'social_admat', 1200, 675],

            ['social.photo.fb_feed', 'Facebook Feed Photo', 'social_photo', 1200, 630],
            ['social.photo.ig_square', 'Instagram Square Photo', 'social_photo', 1080, 1080],

            ['display.leaderboard', 'Leaderboard', 'display', 728, 90],
            ['display.medium_rectangle', 'Medium Rectangle', 'display', 300, 250],
            ['display.skyscraper', 'Skyscraper', 'display', 160, 600],
            ['display.mobile_banner', 'Mobile Banner', 'display', 320, 50],

            ['ooh.billboard_14x48', 'Billboard 14x48', 'ooh', 14, 48, 'ft'],
            ['ooh.poster_8sheet', 'Poster 8-Sheet', 'ooh', 60, 40, 'in'],
            ['ooh.transit_shelter', 'Transit Shelter', 'ooh', 48, 68, 'in'],

            ['digital.spotify.canvas', 'Spotify Canvas', 'digital', 640, 640],
            ['digital.youtube_preroll', 'YouTube Pre-roll', 'digital', 1920, 1080],
            ['digital.programmatic_300x250', 'Programmatic 300x250', 'digital', 300, 250],

            ['print.flyer_letter', 'Flyer (Letter)', 'print', 8, 10, 'in'],
            ['print.poster_11x17', 'Poster 11x17', 'print', 11, 17, 'in'],
            ['print.handbill', 'Handbill', 'print', 4, 6, 'in'],
        ];

        foreach ($items as $row) {
            $unit = $row[5] ?? 'px';
            ItemCatalog::updateOrCreate(
                ['key' => $row[0]],
                [
                    'name' => $row[1],
                    'platform' => $row[2],
                    'width' => $row[3],
                    'height' => $row[4],
                    'unit' => $unit,
                    'meta' => null,
                ],
            );
        }
    }
}
