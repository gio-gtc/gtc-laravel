<?php

use App\Models\BlockDefinition;
use App\Models\FormTemplate;
use App\Models\ItemCatalog;
use App\Models\Venue;
use App\Models\VenueForm;
use App\Support\SchemaResolver;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(Tests\TestCase::class, RefreshDatabase::class);

function buildResolverVenue(array $templateOverrides = [], array $venueOverrides = []): Venue
{
    ItemCatalog::create(['key' => 'a', 'name' => 'A', 'platform' => 'p', 'width' => 1, 'height' => 1, 'unit' => 'px']);
    ItemCatalog::create(['key' => 'b', 'name' => 'B', 'platform' => 'p', 'width' => 2, 'height' => 2, 'unit' => 'px']);
    ItemCatalog::create(['key' => 'c', 'name' => 'C', 'platform' => 'p', 'width' => 3, 'height' => 3, 'unit' => 'px']);

    BlockDefinition::create([
        'key' => 'cta_selector',
        'name' => 'CTA',
        'kind' => 'cta_selector',
        'schema' => ['presets' => [['value' => 'buy', 'label' => 'Buy']]],
        'embeds' => null,
        'version' => 1,
    ]);
    BlockDefinition::create([
        'key' => 'digital',
        'name' => 'Digital',
        'kind' => 'item_list',
        'schema' => ['default_items' => ['a', 'b', 'c']],
        'embeds' => ['cta_selector' => 'cta'],
        'version' => 1,
    ]);

    $template = FormTemplate::create([
        'name' => 'T',
        'slug' => 't',
        'layout' => ['blocks' => [['block_key' => 'digital']]],
        'version' => 1,
        'is_active' => true,
    ]);
    $venue = Venue::create(['name' => 'V', 'slug' => 'v', 'attributes' => []]);
    VenueForm::create(['venue_id' => $venue->id, 'form_template_id' => $template->id, 'overrides' => $venueOverrides ?: null]);

    return $venue;
}

it('produces blocks[] and jsonSchema with per-block properties', function () {
    $venue = buildResolverVenue();
    $res = app(SchemaResolver::class)->resolve($venue);

    expect($res->blocks)->toHaveCount(1);
    expect($res->blocks[0]['kind'])->toBe('item_list');
    expect($res->blocks[0]['items'])->toHaveCount(3);
    expect(array_keys($res->blocks[0]['embeds']))->toBe(['cta']);
    expect($res->jsonSchema['properties'])->toHaveKey('digital');
    $selectedSchema = $res->jsonSchema['properties']['digital']['properties']['selected'];
    expect($selectedSchema['items']['enum'])->toBe(['a', 'b', 'c']);
    expect($res->jsonSchema['properties']['digital']['properties'])->toHaveKey('cta');
    $ctaProps = $res->jsonSchema['properties']['digital']['properties']['cta']['properties'];
    expect($ctaProps)->toHaveKey('presets');
    expect($ctaProps)->not->toHaveKey('preset');
    expect($ctaProps['presets']['uniqueItems'])->toBeTrue();
});

it('applies venue overrides: hidden_items trims the item list and enum', function () {
    $venue = buildResolverVenue(venueOverrides: [
        'blocks' => [
            'update' => [
                'digital' => ['hidden_items' => ['b']],
            ],
        ],
    ]);
    $res = app(SchemaResolver::class)->resolve($venue);

    $itemKeys = array_map(fn ($i) => $i['key'], $res->blocks[0]['items']);
    expect($itemKeys)->toBe(['a', 'c']);
    expect($res->jsonSchema['properties']['digital']['properties']['selected']['items']['enum'])->toBe(['a', 'c']);
});

it('strips order_info file and attachments fields when omitFileFields is true', function () {
    $venue = buildResolverVenue();
    BlockDefinition::create([
        'key' => 'order_info',
        'name' => 'Order Info',
        'kind' => 'order_info',
        'schema' => [
            'fields' => [
                ['key' => 'note', 'label' => 'Note', 'type' => 'text'],
                ['key' => 'admat', 'label' => 'Admat', 'type' => 'file'],
                ['key' => 'attachments', 'label' => 'Attachments', 'type' => 'attachments'],
            ],
        ],
        'embeds' => null,
        'version' => 1,
    ]);
    $template = FormTemplate::where('slug', 't')->first();
    $template->update([
        'layout' => [
            'blocks' => [
                ['block_key' => 'digital'],
                ['block_key' => 'order_info'],
            ],
        ],
    ]);

    $full = app(SchemaResolver::class)->resolve($venue, false);
    $omit = app(SchemaResolver::class)->resolve($venue, true);

    $oiFull = collect($full->blocks)->firstWhere('key', 'order_info');
    $oiOmit = collect($omit->blocks)->firstWhere('key', 'order_info');

    expect(array_column($oiFull['fields'], 'type'))->toContain('file')->toContain('attachments');
    expect(array_column($oiOmit['fields'], 'type'))->not->toContain('file')->not->toContain('attachments');

    expect($full->jsonSchema['properties']['order_info']['properties'])->toHaveKey('admat')
        ->toHaveKey('attachments');
    expect($omit->jsonSchema['properties']['order_info']['properties'])->not->toHaveKey('admat')
        ->not->toHaveKey('attachments');
});
