<?php

namespace App\Observers;

use App\Models\FormAnswer;
use App\Models\FormSubmission;
use App\Support\SchemaResolver;

/**
 * On submission create, explode the nested `answers` JSON into one row per
 * scalar value (and one row per selected item key for `item_list` blocks),
 * persisted into `form_answers` for easy cross-submission reporting.
 */
class FormSubmissionObserver
{
    public function __construct(private SchemaResolver $resolver) {}

    public function created(FormSubmission $submission): void
    {
        $venue = $submission->venue()->with('venueForm.formTemplate')->first();
        if ($venue === null) {
            return;
        }
        $resolution = $this->resolver->resolve($venue);
        $rows = $this->explode($submission, $resolution->blocks, (array) $submission->answers);
        if ($rows === []) {
            return;
        }
        FormAnswer::insert($rows);
    }

    /**
     * @param  array<int, array<string, mixed>>  $blocks
     * @param  array<string, mixed>  $answers
     * @return array<int, array<string, mixed>>
     */
    private function explode(FormSubmission $submission, array $blocks, array $answers): array
    {
        $now = now();
        $rows = [];
        $base = [
            'form_submission_id' => $submission->id,
            'venue_id' => $submission->venue_id,
            'created_at' => $now,
            'updated_at' => $now,
        ];

        foreach ($blocks as $block) {
            $blockKey = $block['key'];
            $kind = $block['kind'];
            $blockValue = $answers[$blockKey] ?? null;
            if ($blockValue === null) {
                continue;
            }

            switch ($kind) {
                case 'item_list':
                    $selected = (array) ($blockValue['selected'] ?? []);
                    foreach ($selected as $i => $key) {
                        $rows[] = $base + [
                            'block_key' => $blockKey,
                            'field_key' => 'selected',
                            'field_type' => 'item',
                            'value_text' => is_string($key) ? $key : null,
                            'value_number' => null,
                            'value_date' => null,
                            'value_bool' => null,
                            'value_file_path' => null,
                        ];
                    }
                    foreach (($block['embeds'] ?? []) as $propName => $embed) {
                        $embedValue = $blockValue[$propName] ?? null;
                        if (is_array($embedValue)) {
                            $rows = array_merge($rows, $this->explodeEmbed($base, $blockKey.'.'.$propName, $embed, $embedValue));
                        }
                    }
                    break;

                case 'cta_selector':
                    $rows = array_merge($rows, $this->explodeCtaSelector($base, $blockKey, (array) $blockValue));
                    break;

                case 'custom_sizes':
                    if (is_array($blockValue)) {
                        foreach ($blockValue as $i => $size) {
                            if (! is_array($size)) {
                                continue;
                            }
                            $rows[] = $base + [
                                'block_key' => $blockKey,
                                'field_key' => "sizes.$i.name",
                                'field_type' => 'text',
                                'value_text' => (string) ($size['name'] ?? ''),
                                'value_number' => null,
                                'value_date' => null,
                                'value_bool' => null,
                                'value_file_path' => null,
                            ];
                            $rows[] = $base + [
                                'block_key' => $blockKey,
                                'field_key' => "sizes.$i.width",
                                'field_type' => 'integer',
                                'value_text' => null,
                                'value_number' => (float) ($size['width'] ?? 0),
                                'value_date' => null,
                                'value_bool' => null,
                                'value_file_path' => null,
                            ];
                            $rows[] = $base + [
                                'block_key' => $blockKey,
                                'field_key' => "sizes.$i.height",
                                'field_type' => 'integer',
                                'value_text' => null,
                                'value_number' => (float) ($size['height'] ?? 0),
                                'value_date' => null,
                                'value_bool' => null,
                                'value_file_path' => null,
                            ];
                        }
                    }
                    break;

                case 'order_info':
                default:
                    foreach (($block['fields'] ?? []) as $field) {
                        if (($field['scope'] ?? 'submission') === 'venue') {
                            continue;
                        }
                        $fieldKey = $field['key'];
                        $value = $blockValue[$fieldKey] ?? null;
                        $rows = array_merge($rows, $this->fieldToRows($base, $blockKey, $field, $value));
                    }
                    break;
            }
        }

        return $rows;
    }

    /**
     * @param  array<string, mixed>  $base
     * @param  array<string, mixed>  $embed
     * @param  array<string, mixed>  $value
     * @return array<int, array<string, mixed>>
     */
    private function explodeEmbed(array $base, string $compositeKey, array $embed, array $value): array
    {
        if (($embed['kind'] ?? null) !== 'cta_selector') {
            return [];
        }

        return $this->explodeCtaSelector($base, $compositeKey, $value);
    }

    /**
     * @param  array<string, mixed>  $base
     * @param  array<string, mixed>  $value
     * @return array<int, array<string, mixed>>
     */
    private function explodeCtaSelector(array $base, string $blockKey, array $value): array
    {
        $rows = [];
        $preset = $value['preset'] ?? null;
        if (is_string($preset) && $preset !== '') {
            $rows[] = $base + [
                'block_key' => $blockKey,
                'field_key' => 'preset',
                'field_type' => 'text',
                'value_text' => $preset,
                'value_number' => null,
                'value_date' => null,
                'value_bool' => null,
                'value_file_path' => null,
            ];
        }
        foreach ((array) ($value['custom'] ?? []) as $i => $cta) {
            if (! is_array($cta)) {
                continue;
            }
            $rows[] = $base + [
                'block_key' => $blockKey,
                'field_key' => "custom.$i.label",
                'field_type' => 'text',
                'value_text' => (string) ($cta['label'] ?? ''),
                'value_number' => null,
                'value_date' => null,
                'value_bool' => null,
                'value_file_path' => null,
            ];
        }

        return $rows;
    }

    /**
     * @param  array<string, mixed>  $base
     * @param  array<string, mixed>  $field
     * @return array<int, array<string, mixed>>
     */
    private function fieldToRows(array $base, string $blockKey, array $field, mixed $value): array
    {
        if ($value === null) {
            return [];
        }
        $type = $field['type'] ?? 'text';
        $key = $field['key'];
        $row = $base + [
            'block_key' => $blockKey,
            'field_key' => $key,
            'field_type' => $type,
            'value_text' => null,
            'value_number' => null,
            'value_date' => null,
            'value_bool' => null,
            'value_file_path' => null,
        ];

        switch ($type) {
            case 'number':
            case 'integer':
                $row['value_number'] = is_numeric($value) ? (float) $value : null;
                break;
            case 'boolean':
                $row['value_bool'] = (bool) $value;
                break;
            case 'date':
                $row['value_date'] = is_string($value) && $value !== '' ? $value : null;
                break;
            case 'file':
                if (is_array($value) && isset($value['path'])) {
                    $row['value_file_path'] = (string) $value['path'];
                }
                break;
            case 'attachments':
                if (is_array($value)) {
                    $rows = [];
                    foreach ($value as $i => $fd) {
                        if (is_array($fd) && isset($fd['path'])) {
                            $rows[] = $base + [
                                'block_key' => $blockKey,
                                'field_key' => "$key.$i",
                                'field_type' => 'file',
                                'value_text' => null,
                                'value_number' => null,
                                'value_date' => null,
                                'value_bool' => null,
                                'value_file_path' => (string) $fd['path'],
                            ];
                        }
                    }

                    return $rows;
                }
                break;
            case 'text':
            case 'textarea':
            case 'email':
            case 'select':
            default:
                $row['value_text'] = is_scalar($value) ? (string) $value : null;
                break;
        }

        return [$row];
    }
}
