<?php

use App\Rules\JsonSchemaRule;
use Illuminate\Support\Facades\Validator;

uses(Tests\TestCase::class);

it('passes validation for a payload that matches the schema', function () {
    $schema = [
        'type' => 'object',
        'properties' => [
            'digital' => [
                'type' => 'object',
                'properties' => [
                    'selected' => [
                        'type' => 'array',
                        'items' => ['type' => 'string', 'enum' => ['a', 'b']],
                        'uniqueItems' => true,
                    ],
                ],
                'additionalProperties' => false,
            ],
        ],
        'additionalProperties' => false,
    ];

    $v = Validator::make(
        ['answers' => ['digital' => ['selected' => ['a']]]],
        ['answers' => [new JsonSchemaRule($schema)]],
    );
    expect($v->passes())->toBeTrue();
});

it('surfaces nested errors keyed by dotted answers path', function () {
    $schema = [
        'type' => 'object',
        'properties' => [
            'digital' => [
                'type' => 'object',
                'properties' => [
                    'selected' => [
                        'type' => 'array',
                        'items' => ['type' => 'string', 'enum' => ['a', 'b']],
                        'uniqueItems' => true,
                    ],
                ],
            ],
        ],
    ];

    $v = Validator::make(
        ['answers' => ['digital' => ['selected' => ['rogue']]]],
        ['answers' => [new JsonSchemaRule($schema)]],
    );

    expect($v->fails())->toBeTrue();
    $errors = $v->errors()->toArray();
    $keys = array_keys($errors);
    $nested = array_filter($keys, fn ($k) => str_starts_with($k, 'answers.digital.selected'));
    expect($nested)->not->toBeEmpty();
});
