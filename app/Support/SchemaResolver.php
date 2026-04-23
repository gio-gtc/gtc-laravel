<?php

namespace App\Support;

use App\Models\BlockDefinition;
use App\Models\ItemCatalog;
use App\Models\Venue;
use RuntimeException;

/**
 * Resolves a venue's {@see Venue} composed form into two consumer-ready views:
 *   1. `blocks[]` — ordered UI descriptors consumed by the React block registry.
 *   2. `jsonSchema` — a single JSON Schema Draft document whose `properties`
 *      are keyed by block_key, used by opis/json-schema on the server and inferred
 *      to Zod on the client.
 *
 * Layout shape (form_templates.layout):
 *   {
 *     "blocks": [
 *       { "block_key": "social.admat", "enabled_items"?: string[], "hidden_items"?: string[], "extra_items"?: ItemShape[] },
 *       ...
 *     ]
 *   }
 *
 * Overrides shape (venue_forms.overrides):
 *   {
 *     "blocks": {
 *       "remove"?: ["block_key", ...],
 *       "update"?: { "block_key": { enabled_items, hidden_items, extra_items } },
 *       "add"?:    [{ "block_key", "after"?: "block_key", "enabled_items"?, "hidden_items"?, "extra_items"? }]
 *     }
 *   }
 *
 * Block-definition schema shape (block_definitions.schema):
 *   {
 *     "default_items"?: ["item.key.1", ...],
 *     "fields"?:        [ { key, label, type, required?, options?, visibleIf?, requiredIf?, maxLength?, min?, max?, accept?, maxSizeMb? } ],
 *     "presets"?:       [ { value, label } ]            // for cta_selector
 *   }
 *
 * Block-definition embeds shape (block_definitions.embeds):
 *   { "<embed_block_key>": "<property_name>" }
 *   e.g. { "cta_selector": "cta" }  =>  digital: { selected: [...], cta: { preset, custom } }
 */
final class SchemaResolver
{
    public function __construct(private ConditionEvaluator $conditions = new ConditionEvaluator) {}

    public function resolve(Venue $venue, bool $omitFileFields = false): SchemaResolution
    {
        $venueForm = $venue->venueForm()->with('formTemplate')->first();
        if ($venueForm === null || $venueForm->formTemplate === null) {
            throw new RuntimeException("Venue {$venue->slug} has no assigned form template.");
        }

        $template = $venueForm->formTemplate;
        $layout = $template->layout ?? ['blocks' => []];
        $overrides = $venueForm->overrides ?? [];

        $placements = $this->mergePlacements($layout['blocks'] ?? [], $overrides['blocks'] ?? []);

        [$blockDefs, $items] = $this->hydrateCatalogs($placements);

        $blocks = [];
        $properties = [];
        $fieldIndex = [];
        foreach ($placements as $placement) {
            $blockKey = $placement['block_key'] ?? null;
            if ($blockKey === null || ! isset($blockDefs[$blockKey])) {
                continue;
            }
            $blockDef = $blockDefs[$blockKey];
            $resolved = $this->resolveBlock($blockDef, $placement, $items, $blockDefs);
            $blocks[] = $resolved['block'];
            $properties[$blockKey] = $resolved['jsonSchema'];
            foreach ($resolved['fields'] as $f) {
                $fieldIndex[] = $f;
            }
        }

        if ($omitFileFields) {
            foreach ($blocks as $i => $block) {
                if (($block['kind'] ?? null) !== BlockDefinition::KIND_ORDER_INFO) {
                    continue;
                }
                $blockKey = $block['key'];
                $filtered = array_values(array_filter(
                    $block['fields'] ?? [],
                    static fn (array $f) => ! in_array($f['type'] ?? '', ['file', 'attachments'], true),
                ));
                $blocks[$i] = array_merge($block, ['fields' => $filtered]);
                $properties[$blockKey] = $this->buildJsonSchemaForKind(
                    BlockDefinition::KIND_ORDER_INFO,
                    [],
                    $filtered,
                    $block['presets'] ?? [],
                    [],
                );
            }
            $fieldIndex = array_values(array_filter(
                $fieldIndex,
                static fn (array $e) => ! in_array($e['field_type'] ?? '', ['file', 'attachments'], true),
            ));
        }

        $jsonSchema = [
            '$schema' => 'https://json-schema.org/draft/2020-12/schema',
            'type' => 'object',
            'properties' => $properties,
            'additionalProperties' => false,
        ];

        return new SchemaResolution($blocks, $jsonSchema, $fieldIndex);
    }

    /**
     * Produce a runtime JSON Schema that has `visibleIf` / `requiredIf` evaluated
     * against the submitted `$payload`. Fields whose `visibleIf` fails are removed;
     * fields with `requiredIf` matching are added to `required`.
     *
     * @param  array<string, mixed>  $baseSchema
     * @param  array<int, array<string, mixed>>  $blocks
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function applyConditions(array $baseSchema, array $blocks, array $payload): array
    {
        $schema = $baseSchema;

        foreach ($blocks as $block) {
            $blockKey = $block['key'];
            if (! isset($schema['properties'][$blockKey])) {
                continue;
            }
            $schema['properties'][$blockKey] = $this->applyConditionsToBlockSchema(
                $schema['properties'][$blockKey],
                $block,
                $payload,
            );
        }

        return $schema;
    }

    /**
     * @param  array<int, array<string, mixed>>  $layoutBlocks
     * @param  array<string, mixed>  $overrideBlocks
     * @return array<int, array<string, mixed>>
     */
    private function mergePlacements(array $layoutBlocks, array $overrideBlocks): array
    {
        $remove = $overrideBlocks['remove'] ?? [];
        $update = $overrideBlocks['update'] ?? [];
        $add = $overrideBlocks['add'] ?? [];

        $result = [];
        foreach ($layoutBlocks as $placement) {
            $k = $placement['block_key'] ?? null;
            if ($k === null || in_array($k, $remove, true)) {
                continue;
            }
            if (isset($update[$k]) && is_array($update[$k])) {
                $placement = array_replace($placement, $update[$k]);
            }
            $result[] = $placement;
        }

        foreach ($add as $newPlacement) {
            if (! isset($newPlacement['block_key'])) {
                continue;
            }
            $after = $newPlacement['after'] ?? null;
            unset($newPlacement['after']);
            if ($after === null) {
                $result[] = $newPlacement;

                continue;
            }
            $inserted = false;
            $next = [];
            foreach ($result as $p) {
                $next[] = $p;
                if (($p['block_key'] ?? null) === $after && ! $inserted) {
                    $next[] = $newPlacement;
                    $inserted = true;
                }
            }
            if (! $inserted) {
                $next[] = $newPlacement;
            }
            $result = $next;
        }

        return $result;
    }

    /**
     * @param  array<int, array<string, mixed>>  $placements
     * @return array{0: array<string, BlockDefinition>, 1: array<string, array<string, mixed>>}
     */
    private function hydrateCatalogs(array $placements): array
    {
        $primaryBlockKeys = array_values(array_filter(array_map(
            static fn (array $p) => $p['block_key'] ?? null,
            $placements
        )));

        $primaryBlockDefs = BlockDefinition::whereIn('key', $primaryBlockKeys)->get()->keyBy('key');

        $embedKeys = [];
        foreach ($primaryBlockDefs as $def) {
            $embeds = $def->embeds ?? [];
            foreach (array_keys($embeds) as $embedKey) {
                $embedKeys[] = $embedKey;
            }
        }
        $embedKeys = array_values(array_unique($embedKeys));
        $embedDefs = $embedKeys
            ? BlockDefinition::whereIn('key', $embedKeys)->get()->keyBy('key')
            : collect();

        // `union` preserves string keys from both collections; `merge` renumbers on
        // numeric-looking keys which can drop our block_key-based index.
        $allBlockDefs = $primaryBlockDefs->union($embedDefs)->all();

        $itemKeys = [];
        foreach ($placements as $p) {
            $blockKey = $p['block_key'] ?? null;
            if ($blockKey === null || ! isset($allBlockDefs[$blockKey])) {
                continue;
            }
            $blockDef = $allBlockDefs[$blockKey];
            $defaults = $blockDef->schema['default_items'] ?? [];
            $enabled = $p['enabled_items'] ?? $defaults;
            $hidden = $p['hidden_items'] ?? [];
            $activeKeys = array_values(array_diff($enabled, $hidden));
            foreach ($activeKeys as $k) {
                $itemKeys[] = $k;
            }
        }
        $itemKeys = array_values(array_unique($itemKeys));
        $items = $itemKeys
            ? ItemCatalog::whereIn('key', $itemKeys)->get()->keyBy('key')->map->toArray()->all()
            : [];

        return [$allBlockDefs, $items];
    }

    /**
     * @param  array<string, mixed>  $placement
     * @param  array<string, array<string, mixed>>  $items
     * @param  array<string, BlockDefinition>  $blockDefs
     * @return array{block: array<string, mixed>, jsonSchema: array<string, mixed>, fields: array<int, array<string, mixed>>}
     */
    private function resolveBlock(BlockDefinition $blockDef, array $placement, array $items, array $blockDefs, bool $isEmbed = false): array
    {
        $schema = $blockDef->schema ?? [];
        $kind = $blockDef->kind;

        $defaults = $schema['default_items'] ?? [];
        $enabled = $placement['enabled_items'] ?? $defaults;
        $hidden = $placement['hidden_items'] ?? [];
        $extra = $placement['extra_items'] ?? [];

        $activeKeys = array_values(array_diff($enabled, $hidden));
        $resolvedItems = [];
        foreach ($activeKeys as $k) {
            if (isset($items[$k])) {
                $resolvedItems[] = $items[$k];
            }
        }
        foreach ($extra as $item) {
            if (is_array($item) && isset($item['key'], $item['name'])) {
                $resolvedItems[] = $item;
            }
        }

        $fields = $schema['fields'] ?? [];
        $presets = $schema['presets'] ?? [];

        $embeds = [];
        if (! $isEmbed) {
            foreach (($blockDef->embeds ?? []) as $embedKey => $propName) {
                if (! isset($blockDefs[$embedKey])) {
                    continue;
                }
                $embedResolved = $this->resolveBlock(
                    $blockDefs[$embedKey],
                    ['block_key' => $embedKey],
                    $items,
                    $blockDefs,
                    isEmbed: true,
                );
                $embeds[$propName] = $embedResolved['block'];
            }
        }

        $uiBlock = [
            'key' => $blockDef->key,
            'name' => $blockDef->name,
            'kind' => $kind,
            'items' => $resolvedItems,
            'fields' => $fields,
            'presets' => $presets,
            'embeds' => $embeds,
        ];

        $jsonSchema = $this->buildJsonSchemaForKind($kind, $resolvedItems, $fields, $presets, $embeds);

        $fieldIndex = [];
        foreach ($fields as $f) {
            $fieldIndex[] = [
                'block_key' => $blockDef->key,
                'field_key' => $f['key'],
                'field_type' => $f['type'],
                'scope' => $f['scope'] ?? 'submission',
            ];
        }

        return [
            'block' => $uiBlock,
            'jsonSchema' => $jsonSchema,
            'fields' => $fieldIndex,
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $items
     * @param  array<int, array<string, mixed>>  $fields
     * @param  array<int, array<string, mixed>>  $presets
     * @param  array<string, array<string, mixed>>  $embeds
     * @return array<string, mixed>
     */
    private function buildJsonSchemaForKind(string $kind, array $items, array $fields, array $presets, array $embeds): array
    {
        switch ($kind) {
            case BlockDefinition::KIND_ITEM_LIST:
                $itemKeys = array_values(array_filter(array_map(
                    static fn (array $i) => $i['key'] ?? null,
                    $items
                )));
                $selectedItemsSchema = $itemKeys === []
                    ? ['type' => 'string']
                    : ['type' => 'string', 'enum' => $itemKeys];
                $props = [
                    'selected' => [
                        'type' => 'array',
                        'items' => $selectedItemsSchema,
                        'uniqueItems' => true,
                    ],
                ];
                foreach ($embeds as $propName => $embed) {
                    $props[$propName] = $this->buildJsonSchemaForKind(
                        $embed['kind'],
                        $embed['items'],
                        $embed['fields'],
                        $embed['presets'] ?? [],
                        $embed['embeds'] ?? [],
                    );
                }

                return [
                    'type' => 'object',
                    'properties' => $props,
                    'additionalProperties' => false,
                ];

            case BlockDefinition::KIND_CTA_SELECTOR:
                $presetValues = array_values(array_filter(array_map(
                    static fn (array $p) => $p['value'] ?? null,
                    $presets
                )));
                $presetSchema = $presetValues === []
                    ? ['type' => ['string', 'null']]
                    : ['anyOf' => [
                        ['type' => 'string', 'enum' => $presetValues],
                        ['type' => 'null'],
                    ]];

                return [
                    'type' => 'object',
                    'properties' => [
                        'preset' => $presetSchema,
                        'custom' => [
                            'type' => 'array',
                            'items' => [
                                'type' => 'object',
                                'required' => ['label'],
                                'properties' => [
                                    'label' => ['type' => 'string', 'minLength' => 1, 'maxLength' => 200],
                                ],
                                'additionalProperties' => false,
                            ],
                        ],
                    ],
                    'additionalProperties' => false,
                ];

            case BlockDefinition::KIND_CUSTOM_SIZES:
                return [
                    'type' => 'array',
                    'items' => [
                        'type' => 'object',
                        'required' => ['name', 'width', 'height'],
                        'properties' => [
                            'name' => ['type' => 'string', 'minLength' => 1, 'maxLength' => 200],
                            'width' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 100000],
                            'height' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 100000],
                        ],
                        'additionalProperties' => false,
                    ],
                ];

            case BlockDefinition::KIND_ORDER_INFO:
            default:
                $props = [];
                $required = [];
                foreach ($fields as $f) {
                    $props[$f['key']] = $this->fieldToJsonSchema($f);
                    if (! empty($f['required'])) {
                        $required[] = $f['key'];
                    }
                }
                $schema = [
                    'type' => 'object',
                    'properties' => $props,
                    'additionalProperties' => false,
                ];
                if ($required) {
                    $schema['required'] = array_values(array_unique($required));
                }

                return $schema;
        }
    }

    /**
     * @param  array<string, mixed>  $field
     * @return array<string, mixed>
     */
    private function fieldToJsonSchema(array $field): array
    {
        $type = $field['type'] ?? 'text';
        $schema = [];
        switch ($type) {
            case 'text':
            case 'textarea':
            case 'email':
                $schema['type'] = 'string';
                if ($type === 'email') {
                    $schema['format'] = 'email';
                }
                if (isset($field['maxLength'])) {
                    $schema['maxLength'] = (int) $field['maxLength'];
                }
                break;
            case 'number':
                $schema['type'] = 'number';
                if (isset($field['min'])) {
                    $schema['minimum'] = (float) $field['min'];
                }
                if (isset($field['max'])) {
                    $schema['maximum'] = (float) $field['max'];
                }
                break;
            case 'integer':
                $schema['type'] = 'integer';
                if (isset($field['min'])) {
                    $schema['minimum'] = (int) $field['min'];
                }
                if (isset($field['max'])) {
                    $schema['maximum'] = (int) $field['max'];
                }
                break;
            case 'boolean':
                $schema['type'] = 'boolean';
                break;
            case 'date':
                $schema['type'] = 'string';
                $schema['format'] = 'date';
                break;
            case 'datetime':
                $schema['type'] = 'string';
                $schema['format'] = 'date-time';
                break;
            case 'select':
                $values = array_values(array_filter(array_map(
                    static fn (array $o) => $o['value'] ?? null,
                    $field['options'] ?? []
                )));
                $schema['type'] = 'string';
                if ($values) {
                    $schema['enum'] = $values;
                }
                break;
            case 'file':
                return $this->fileDescriptorSchema();
            case 'attachments':
                return [
                    'type' => 'array',
                    'items' => $this->fileDescriptorSchema(),
                ];
            default:
                $schema['type'] = 'string';
        }

        if (empty($field['required']) && isset($schema['type']) && is_string($schema['type'])) {
            $schema['type'] = [$schema['type'], 'null'];
        }

        return $schema;
    }

    /** @return array<string, mixed> */
    private function fileDescriptorSchema(): array
    {
        return [
            'type' => 'object',
            'required' => ['path'],
            'properties' => [
                'path' => ['type' => 'string', 'minLength' => 1, 'maxLength' => 500],
                'url' => ['type' => 'string'],
                'size' => ['type' => 'integer', 'minimum' => 0],
                'mime' => ['type' => 'string'],
                'name' => ['type' => 'string'],
            ],
            'additionalProperties' => false,
        ];
    }

    /**
     * @param  array<string, mixed>  $blockSchema
     * @param  array<string, mixed>  $block
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function applyConditionsToBlockSchema(array $blockSchema, array $block, array $payload): array
    {
        if (($block['kind'] ?? null) !== BlockDefinition::KIND_ORDER_INFO) {
            return $blockSchema;
        }

        $fields = $block['fields'] ?? [];
        $required = [];

        foreach ($fields as $f) {
            $key = $f['key'];
            $visibleIf = $f['visibleIf'] ?? null;
            $requiredIf = $f['requiredIf'] ?? null;

            $isVisible = $this->conditions->evaluate($visibleIf, $payload);
            if (! $isVisible) {
                unset($blockSchema['properties'][$key]);

                continue;
            }

            $isRequired = ! empty($f['required']) || $this->conditions->evaluate($requiredIf, $payload);
            if ($isRequired && $requiredIf !== null) {
                $required[] = $key;
            } elseif (! empty($f['required'])) {
                $required[] = $key;
            }
        }

        if ($required) {
            $blockSchema['required'] = array_values(array_unique($required));
        } else {
            unset($blockSchema['required']);
        }

        return $blockSchema;
    }
}
