<?php

namespace App\Support;

final class SchemaResolution
{
    /**
     * @param  array<int, array<string, mixed>>  $blocks  UI-facing ordered list of block descriptors.
     * @param  array<string, mixed>  $jsonSchema  Draft 2020-12 JSON Schema for the full `answers` object.
     * @param  array<int, array<string, mixed>>  $fieldIndex  Flat list of submission-scope fields for reporting/validation.
     */
    public function __construct(
        public array $blocks,
        public array $jsonSchema,
        public array $fieldIndex = [],
    ) {}

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'blocks' => $this->blocks,
            'jsonSchema' => $this->jsonSchema,
        ];
    }
}
