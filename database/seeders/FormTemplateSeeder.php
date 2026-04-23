<?php

namespace Database\Seeders;

use App\Models\FormTemplate;
use Illuminate\Database\Seeder;

class FormTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $arena = [
            ['block_key' => 'social.admat'],
            ['block_key' => 'social.photo'],
            ['block_key' => 'display'],
            ['block_key' => 'ooh'],
            ['block_key' => 'digital'],
            ['block_key' => 'print'],
            ['block_key' => 'custom_sizes'],
            ['block_key' => 'order_info'],
        ];

        $amphitheater = [
            ['block_key' => 'social.admat'],
            ['block_key' => 'display'],
            ['block_key' => 'ooh'],
            ['block_key' => 'digital'],
            ['block_key' => 'custom_sizes'],
            ['block_key' => 'order_info'],
        ];

        $theater = [
            ['block_key' => 'social.admat'],
            ['block_key' => 'social.photo'],
            ['block_key' => 'print'],
            ['block_key' => 'order_info'],
        ];

        $templates = [
            ['slug' => 'arena_standard', 'name' => 'Arena Standard', 'layout' => ['blocks' => $arena]],
            ['slug' => 'amphitheater_standard', 'name' => 'Amphitheater Standard', 'layout' => ['blocks' => $amphitheater]],
            ['slug' => 'theater_standard', 'name' => 'Theater Standard', 'layout' => ['blocks' => $theater]],
        ];

        foreach ($templates as $t) {
            FormTemplate::updateOrCreate(
                ['slug' => $t['slug']],
                [
                    'name' => $t['name'],
                    'layout' => $t['layout'],
                    'version' => 1,
                    'is_active' => true,
                ],
            );
        }
    }
}
