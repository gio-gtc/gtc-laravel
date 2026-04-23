<?php

use App\Models\BlockDefinition;
use App\Models\FormSubmission;
use App\Models\FormTemplate;
use App\Models\ItemCatalog;
use App\Models\User;
use App\Models\Venue;
use App\Models\VenueForm;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

/**
 * @return array{venue: Venue, mockVenueId: int}
 */
function seedFormFixture(): array
{
    ItemCatalog::create(['key' => 'digital.a', 'name' => 'Digital A', 'platform' => 'digital', 'width' => 300, 'height' => 250, 'unit' => 'px']);
    ItemCatalog::create(['key' => 'digital.b', 'name' => 'Digital B', 'platform' => 'digital', 'width' => 728, 'height' => 90, 'unit' => 'px']);

    BlockDefinition::create([
        'key' => 'cta_selector',
        'name' => 'CTA',
        'kind' => 'cta_selector',
        'schema' => [
            'presets' => [
                ['value' => 'get_tickets', 'label' => 'Get Tickets'],
            ],
        ],
        'embeds' => null,
        'version' => 1,
    ]);
    BlockDefinition::create([
        'key' => 'digital',
        'name' => 'Digital',
        'kind' => 'item_list',
        'schema' => ['default_items' => ['digital.a', 'digital.b']],
        'embeds' => ['cta_selector' => 'cta'],
        'version' => 1,
    ]);
    BlockDefinition::create([
        'key' => 'order_info',
        'name' => 'Order Info',
        'kind' => 'order_info',
        'schema' => [
            'fields' => [
                ['key' => 'deadline', 'label' => 'Deadline', 'type' => 'date', 'required' => true],
                ['key' => 'broadcast_type', 'label' => 'Broadcast Type', 'type' => 'select', 'required' => true, 'options' => [
                    ['value' => 'tv', 'label' => 'TV'],
                    ['value' => 'digital', 'label' => 'Digital'],
                ]],
                ['key' => 'station_call_letters', 'label' => 'Station', 'type' => 'text', 'requiredIf' => ['field' => 'order_info.broadcast_type', 'op' => 'eq', 'value' => 'tv']],
            ],
        ],
        'embeds' => null,
        'version' => 1,
    ]);

    $template = FormTemplate::create([
        'name' => 'Test',
        'slug' => 'test-standard',
        'layout' => [
            'blocks' => [
                ['block_key' => 'digital'],
                ['block_key' => 'order_info'],
            ],
        ],
        'version' => 1,
        'is_active' => true,
    ]);
    $mockVenueId = 999;
    $venue = Venue::create([
        'name' => 'Test Arena',
        'slug' => 'test-arena',
        'mock_venue_id' => $mockVenueId,
        'attributes' => [],
    ]);
    VenueForm::create(['venue_id' => $venue->id, 'form_template_id' => $template->id, 'overrides' => null]);

    return ['venue' => $venue, 'mockVenueId' => $mockVenueId];
}

it('returns the venue form JSON schema for authenticated users', function () {
    ['mockVenueId' => $mockVenueId] = seedFormFixture();
    $this->actingAs(User::factory()->create());

    $this->getJson("/venue-forms/{$mockVenueId}/schema")
        ->assertOk()
        ->assertJsonPath('venue.slug', 'test-arena')
        ->assertJsonPath('venue.mock_venue_id', $mockVenueId)
        ->assertJsonCount(2, 'blocks')
        ->assertJsonStructure([
            'venue' => ['id', 'name', 'slug', 'mock_venue_id', 'attributes'],
            'blocks',
            'jsonSchema',
            'submitAction',
            'uploadAction',
            'scope',
        ]);
});

it('records a submission with order_id and tour_venue_id on happy path', function () {
    ['mockVenueId' => $mockVenueId, 'venue' => $venue] = seedFormFixture();
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->postJson("/venue-forms/{$mockVenueId}", [
        'order_id' => 42,
        'tour_venue_id' => 101,
        'answers' => [
            'digital' => [
                'selected' => ['digital.a'],
                'cta' => ['preset' => 'get_tickets', 'custom' => []],
            ],
            'order_info' => [
                'deadline' => '2027-01-01',
                'broadcast_type' => 'digital',
            ],
        ],
    ])->assertOk()->assertJsonPath('status', 'ok');

    expect(FormSubmission::count())->toBe(1);
    $sub = FormSubmission::first();
    expect($sub->venue_id)->toBe($venue->id);
    expect($sub->order_id)->toBe(42);
    expect($sub->tour_venue_id)->toBe(101);
    expect($sub->answerRows()->where('field_key', 'selected')->count())->toBe(1);
});

it('rejects a rogue item key not present in the enabled set', function () {
    ['mockVenueId' => $mockVenueId] = seedFormFixture();
    $this->actingAs(User::factory()->create());

    $this->postJson("/venue-forms/{$mockVenueId}", [
        'answers' => [
            'digital' => ['selected' => ['digital.totally_fake']],
            'order_info' => ['deadline' => '2027-01-01', 'broadcast_type' => 'digital'],
        ],
    ])->assertStatus(422);

    expect(FormSubmission::count())->toBe(0);
});

it('requires station_call_letters when broadcast_type is tv (requiredIf)', function () {
    ['mockVenueId' => $mockVenueId] = seedFormFixture();
    $this->actingAs(User::factory()->create());

    $this->postJson("/venue-forms/{$mockVenueId}", [
        'answers' => [
            'digital' => ['selected' => [], 'cta' => ['preset' => null, 'custom' => []]],
            'order_info' => ['deadline' => '2027-01-01', 'broadcast_type' => 'tv'],
        ],
    ])->assertStatus(422);
});

it('allows station_call_letters to be omitted when broadcast_type is not tv', function () {
    ['mockVenueId' => $mockVenueId] = seedFormFixture();
    $this->actingAs(User::factory()->create());

    $this->postJson("/venue-forms/{$mockVenueId}", [
        'answers' => [
            'digital' => ['selected' => [], 'cta' => ['preset' => null, 'custom' => []]],
            'order_info' => ['deadline' => '2027-01-01', 'broadcast_type' => 'digital'],
        ],
    ])->assertOk();
});

it('rejects a file descriptor with a path not issued by UploadController', function () {
    ['mockVenueId' => $mockVenueId] = seedFormFixture();
    $this->actingAs(User::factory()->create());

    $def = BlockDefinition::where('key', 'order_info')->first();
    $schema = $def->schema;
    $schema['fields'][] = ['key' => 'admat', 'label' => 'Admat', 'type' => 'file'];
    $def->update(['schema' => $schema]);

    $this->postJson("/venue-forms/{$mockVenueId}", [
        'answers' => [
            'digital' => ['selected' => [], 'cta' => ['preset' => null, 'custom' => []]],
            'order_info' => [
                'deadline' => '2027-01-01',
                'broadcast_type' => 'digital',
                'admat' => ['path' => 'forms/HAX/totally-not-real.png', 'url' => '', 'size' => 10, 'mime' => 'image/png', 'name' => 'x.png'],
            ],
        ],
    ])->assertStatus(422);
});

it('strips file and attachments from schema and submits when omit_file_fields is set', function () {
    ['mockVenueId' => $mockVenueId, 'venue' => $venue] = seedFormFixture();
    $this->actingAs(User::factory()->create());

    $def = BlockDefinition::where('key', 'order_info')->first();
    $schema = $def->schema;
    $schema['fields'][] = ['key' => 'admat', 'label' => 'Admat', 'type' => 'file'];
    $schema['fields'][] = ['key' => 'attachments', 'label' => 'Attachments', 'type' => 'attachments'];
    $def->update(['schema' => $schema]);

    $response = $this->getJson("/venue-forms/{$mockVenueId}/schema?omit_file_fields=1")
        ->assertOk()
        ->assertJsonPath('venue.slug', 'test-arena');
    $orderInfoBlock = collect($response->json('blocks'))->firstWhere('key', 'order_info');
    expect(array_column($orderInfoBlock['fields'], 'type'))->not->toContain('file')->not->toContain('attachments');
    expect($response->json('jsonSchema.properties.order_info.properties'))->not->toHaveKey('admat')
        ->not->toHaveKey('attachments');

    $this->postJson("/venue-forms/{$mockVenueId}", [
        'omit_file_fields' => true,
        'order_id' => 1,
        'tour_venue_id' => 2,
        'answers' => [
            'digital' => [
                'selected' => ['digital.a'],
                'cta' => ['preset' => 'get_tickets', 'custom' => []],
            ],
            'order_info' => [
                'deadline' => '2027-01-01',
                'broadcast_type' => 'digital',
            ],
        ],
    ])->assertOk()->assertJsonPath('status', 'ok');

    expect(FormSubmission::where('venue_id', $venue->id)->count())->toBe(1);
});

it('accepts file descriptor when path was issued by UploadController', function () {
    ['mockVenueId' => $mockVenueId] = seedFormFixture();
    $this->actingAs(User::factory()->create());
    $def = BlockDefinition::where('key', 'order_info')->first();
    $schema = $def->schema;
    $schema['fields'][] = ['key' => 'admat', 'label' => 'Admat', 'type' => 'file'];
    $def->update(['schema' => $schema]);

    $scope = 'test:'.uniqid();
    $upload = $this->postJson(route('uploads.store'), [
        'file' => \Illuminate\Http\UploadedFile::fake()->image('x.png'),
        'scope' => $scope,
    ]);
    $upload->assertOk();
    $path = $upload->json('path');

    $this->postJson("/venue-forms/{$mockVenueId}", [
        'scope' => $scope,
        'answers' => [
            'digital' => ['selected' => [], 'cta' => ['preset' => null, 'custom' => []]],
            'order_info' => [
                'deadline' => '2027-01-01',
                'broadcast_type' => 'digital',
                'admat' => [
                    'path' => $path,
                    'url' => 'https://example.com/x.png',
                    'size' => 10,
                    'mime' => 'image/png',
                    'name' => 'x.png',
                ],
            ],
        ],
    ])->assertOk();
});
