<?php

namespace Database\Seeders;

use App\Models\FormTemplate;
use App\Models\Venue;
use App\Models\VenueForm;
use Illuminate\Database\Seeder;

class VenueSeeder extends Seeder
{
    public function run(): void
    {
        $arena = FormTemplate::where('slug', 'arena_standard')->first();
        $amphitheater = FormTemplate::where('slug', 'amphitheater_standard')->first();
        $theater = FormTemplate::where('slug', 'theater_standard')->first();

        // mock_venue_id values mirror config/mockdata/generated/venues.json so the
        // orders slideout can map its mock venue to a real row via Option B
        // (mock_venue_id column on the venues table).
        $bindings = [
            [
                'venue' => ['name' => 'Madison Square Garden', 'slug' => 'madison-square-garden', 'mock_venue_id' => 1],
                'template' => $arena,
                'overrides' => null,
            ],
            [
                'venue' => ['name' => 'Sunset Amphitheater at McKinney', 'slug' => 'sunset-amphitheater-mckinney', 'mock_venue_id' => 2],
                'template' => $amphitheater,
                'overrides' => [
                    'blocks' => [
                        'update' => [
                            'display' => [
                                'hidden_items' => ['display.mobile_banner'],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'venue' => ['name' => 'Alys Robinson Stephens Performing Arts Center', 'slug' => 'alys-robinson-stephens-pac', 'mock_venue_id' => 3],
                'template' => $theater,
                'overrides' => null,
            ],
            [
                'venue' => ['name' => 'The Coca Cola Charlotte Harbor Event and Conference Center', 'slug' => 'coca-cola-charlotte-harbor', 'mock_venue_id' => 4],
                'template' => $theater,
                'overrides' => null,
            ],
            [
                'venue' => ['name' => 'Hollywood Bowl', 'slug' => 'hollywood-bowl', 'mock_venue_id' => 5],
                'template' => $amphitheater,
                'overrides' => null,
            ],
            [
                'venue' => ['name' => 'Chase Center', 'slug' => 'chase-center', 'mock_venue_id' => 6],
                'template' => $arena,
                'overrides' => null,
            ],
            [
                'venue' => ['name' => 'The Orpheum Theatre', 'slug' => 'orpheum-theatre', 'mock_venue_id' => null],
                'template' => $theater,
                'overrides' => null,
            ],
        ];

        foreach ($bindings as $binding) {
            if ($binding['template'] === null) {
                continue;
            }
            $venue = Venue::updateOrCreate(
                ['slug' => $binding['venue']['slug']],
                [
                    'name' => $binding['venue']['name'],
                    'mock_venue_id' => $binding['venue']['mock_venue_id'],
                    'attributes' => [],
                ],
            );
            VenueForm::updateOrCreate(
                ['venue_id' => $venue->id],
                [
                    'form_template_id' => $binding['template']->id,
                    'overrides' => $binding['overrides'],
                ],
            );
        }
    }
}
