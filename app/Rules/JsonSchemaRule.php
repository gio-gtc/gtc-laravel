<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\ValidatorAwareRule;
use Illuminate\Validation\Validator as LaravelValidator;
use Opis\JsonSchema\Errors\ErrorFormatter;
use Opis\JsonSchema\Errors\ValidationError;
use Opis\JsonSchema\Validator as OpisValidator;

/**
 * Validates a request attribute against a JSON Schema (Draft 2020-12) using
 * opis/json-schema and adds errors to the host Laravel validator keyed by
 * Inertia-friendly dot paths under the root attribute
 * (e.g. `answers.digital.selected.0`).
 */
final class JsonSchemaRule implements ValidationRule, ValidatorAwareRule
{
    private LaravelValidator $validator;

    /** @param  array<string, mixed>  $schema */
    public function __construct(private array $schema) {}

    public function setValidator(LaravelValidator $validator): self
    {
        $this->validator = $validator;

        return $this;
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $opis = new OpisValidator;
        $result = $opis->validate(
            $this->deepToObject($value),
            $this->deepToObject($this->schema),
        );

        if ($result->isValid()) {
            return;
        }

        /** @var ValidationError $error */
        $error = $result->error();
        $formatter = new ErrorFormatter;

        $errors = $formatter->format(
            $error,
            multiple: true,
            formatter: static function (ValidationError $e, string $message): string {
                return $message;
            },
            key_formatter: function (ValidationError $e) use ($attribute): string {
                return $this->pointerToDotPath($e->data()->fullPath(), $attribute);
            }
        );

        $bag = $this->validator->errors();
        foreach ($errors as $dotPath => $messages) {
            foreach ((array) $messages as $message) {
                $bag->add($dotPath, (string) $message);
            }
        }

        // Ensure the rule is treated as failed by adding a (possibly redundant)
        // high-level failure; Laravel will merge duplicates in its error bag.
        $fail('The :attribute does not satisfy the form schema.')->translate();
    }

    /**
     * Convert opis error paths (array of path segments) to Laravel dotted keys
     * prefixed with the root attribute, e.g. `answers.digital.selected.0`.
     *
     * @param  array<int, string|int>  $path
     */
    public function pointerToDotPath(array $path, string $root): string
    {
        if ($path === []) {
            return $root;
        }
        $parts = array_map(static fn ($p) => (string) $p, $path);

        return $root.'.'.implode('.', $parts);
    }

    private function deepToObject(mixed $value): mixed
    {
        if (is_array($value)) {
            if (array_is_list($value)) {
                return array_map(fn ($v) => $this->deepToObject($v), array_values($value));
            }
            $obj = new \stdClass;
            foreach ($value as $k => $v) {
                $obj->{$k} = $this->deepToObject($v);
            }

            return $obj;
        }

        return $value;
    }
}
