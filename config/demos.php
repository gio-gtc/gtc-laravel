<?php

/**
 * Mock demo payloads keyed by UUID for the public /demo/{uuid} viewer.
 * Replace with database-backed data when ready.
 */
return [
    'items' => [
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' => [
            'tourName' => 'Shakira 2025',
            'venueName' => 'Marketing collateral',
            'assets' => [
                [
                    'id' => 'asset-broadcast-1',
                    'tab' => 'broadcast',
                    'title' => 'Video international',
                    'durationLabel' => '00:30',
                    'thumbnailUrl' => 'https://picsum.photos/seed/gtc-b1/320/180',
                    'mediaUrl' => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                    'kind' => 'video',
                ],
                [
                    'id' => 'asset-broadcast-2',
                    'tab' => 'broadcast',
                    'title' => 'Video international superless v2',
                    'durationLabel' => '01:12',
                    'thumbnailUrl' => 'https://picsum.photos/seed/gtc-b2/320/180',
                    'mediaUrl' => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
                    'kind' => 'video',
                ],
                [
                    'id' => 'asset-social-1',
                    'tab' => 'social',
                    'title' => 'Instagram story loop',
                    'durationLabel' => '00:15',
                    'thumbnailUrl' => 'https://picsum.photos/seed/gtc-s1/320/180',
                    'mediaUrl' => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
                    'kind' => 'video',
                ],
                [
                    'id' => 'asset-social-2',
                    'tab' => 'social',
                    'title' => 'TikTok cutdown',
                    'durationLabel' => '00:45',
                    'thumbnailUrl' => 'https://picsum.photos/seed/gtc-s2/320/180',
                    'mediaUrl' => 'https://picsum.photos/seed/gtc-s2-full/1920/1080',
                    'kind' => 'image',
                ],
                [
                    'id' => 'asset-radio-1',
                    'tab' => 'radio',
                    'title' => '30s spot — clean',
                    'durationLabel' => '00:30',
                    'thumbnailUrl' => 'https://picsum.photos/seed/gtc-r1/320/180',
                    'mediaUrl' => 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                    'kind' => 'audio',
                ],
                [
                    'id' => 'asset-art-1',
                    'tab' => 'art',
                    'title' => 'Key art horizontal',
                    'durationLabel' => '—',
                    'thumbnailUrl' => 'https://picsum.photos/seed/gtc-a1/320/180',
                    'mediaUrl' => 'https://picsum.photos/seed/gtc-a1-full/1920/1080',
                    'kind' => 'image',
                ],
            ],
        ],
    ],
];
