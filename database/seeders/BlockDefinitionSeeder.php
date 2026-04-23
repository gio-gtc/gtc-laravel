<?php

namespace Database\Seeders;

use App\Models\BlockDefinition;
use Illuminate\Database\Seeder;

class BlockDefinitionSeeder extends Seeder
{
    public function run(): void
    {
        $ctaSelector = [
            'key' => 'cta_selector',
            'name' => 'CTA',
            'kind' => 'cta_selector',
            'schema' => [
                'presets' => [
                    ['value' => 'get_tickets_friday', 'label' => 'Get Tickets Friday'],
                    ['value' => 'get_tickets_now', 'label' => 'Get Tickets Now'],
                    ['value' => 'on_sale_now', 'label' => 'On Sale Now'],
                ],
            ],
            'embeds' => null,
        ];

        $blocks = [
            $ctaSelector,
            [
                'key' => 'social.admat',
                'name' => 'Social Admat',
                'kind' => 'item_list',
                'schema' => [
                    'default_items' => [
                        'social.admat.fb_feed',
                        'social.admat.ig_story',
                        'social.admat.ig_square',
                        'social.admat.tw_post',
                    ],
                ],
                'embeds' => null,
            ],
            [
                'key' => 'social.photo',
                'name' => 'Social Photo',
                'kind' => 'item_list',
                'schema' => [
                    'default_items' => [
                        'social.photo.fb_feed',
                        'social.photo.ig_square',
                    ],
                ],
                'embeds' => null,
            ],
            [
                'key' => 'display',
                'name' => 'Display Banners',
                'kind' => 'item_list',
                'schema' => [
                    'default_items' => [
                        'display.leaderboard',
                        'display.medium_rectangle',
                        'display.skyscraper',
                        'display.mobile_banner',
                    ],
                ],
                'embeds' => ['cta_selector' => 'cta'],
            ],
            [
                'key' => 'ooh',
                'name' => 'Out-of-Home',
                'kind' => 'item_list',
                'schema' => [
                    'default_items' => [
                        'ooh.billboard_14x48',
                        'ooh.poster_8sheet',
                        'ooh.transit_shelter',
                    ],
                ],
                'embeds' => ['cta_selector' => 'cta'],
            ],
            [
                'key' => 'digital',
                'name' => 'Digital',
                'kind' => 'item_list',
                'schema' => [
                    'default_items' => [
                        'digital.spotify.canvas',
                        'digital.youtube_preroll',
                        'digital.programmatic_300x250',
                    ],
                ],
                'embeds' => ['cta_selector' => 'cta'],
            ],
            [
                'key' => 'print',
                'name' => 'Print',
                'kind' => 'item_list',
                'schema' => [
                    'default_items' => [
                        'print.flyer_letter',
                        'print.poster_11x17',
                        'print.handbill',
                    ],
                ],
                'embeds' => ['cta_selector' => 'cta'],
            ],
            [
                'key' => 'custom_sizes',
                'name' => 'Custom Sizes',
                'kind' => 'custom_sizes',
                'schema' => [],
                'embeds' => null,
            ],
            [
                'key' => 'order_info',
                'name' => 'Order Info',
                'kind' => 'order_info',
                'schema' => [
                    'fields' => [
                        [
                            'key' => 'deadline',
                            'label' => 'Deadline',
                            'type' => 'date',
                            'required' => true,
                        ],
                        [
                            'key' => 'broadcast_type',
                            'label' => 'Broadcast Type',
                            'type' => 'select',
                            'required' => true,
                            'options' => [
                                ['value' => 'tv', 'label' => 'TV'],
                                ['value' => 'radio', 'label' => 'Radio'],
                                ['value' => 'digital', 'label' => 'Digital'],
                            ],
                        ],
                        [
                            'key' => 'station_call_letters',
                            'label' => 'Station Call Letters',
                            'type' => 'text',
                            'maxLength' => 12,
                            'requiredIf' => [
                                'field' => 'order_info.broadcast_type',
                                'op' => 'in',
                                'value' => ['tv', 'radio'],
                            ],
                        ],
                        [
                            'key' => 'admat',
                            'label' => 'Admat / Key Art',
                            'type' => 'file',
                            'accept' => 'image/*,application/pdf',
                            'maxSizeMb' => 20,
                        ],
                        [
                            'key' => 'special_instructions',
                            'label' => 'Special Instructions',
                            'type' => 'textarea',
                            'maxLength' => 2000,
                        ],
                        [
                            'key' => 'attachments',
                            'label' => 'Attachments',
                            'type' => 'attachments',
                            'accept' => 'image/*,application/pdf',
                            'maxSizeMb' => 20,
                        ],
                    ],
                ],
                'embeds' => null,
            ],
        ];

        foreach ($blocks as $b) {
            BlockDefinition::updateOrCreate(
                ['key' => $b['key']],
                [
                    'name' => $b['name'],
                    'kind' => $b['kind'],
                    'schema' => $b['schema'],
                    'embeds' => $b['embeds'],
                    'version' => 1,
                ],
            );
        }
    }
}
