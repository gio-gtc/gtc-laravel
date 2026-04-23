<?php

use App\Support\ConditionEvaluator;

it('returns true for empty or malformed rules', function () {
    $eval = new ConditionEvaluator;
    expect($eval->evaluate(null, []))->toBeTrue();
    expect($eval->evaluate([], []))->toBeTrue();
    expect($eval->evaluate(['field' => 'foo'], []))->toBeTrue();
});

it('evaluates eq/neq operators', function () {
    $eval = new ConditionEvaluator;
    $values = ['order_info' => ['broadcast_type' => 'tv']];
    expect($eval->evaluate(['field' => 'order_info.broadcast_type', 'op' => 'eq', 'value' => 'tv'], $values))->toBeTrue();
    expect($eval->evaluate(['field' => 'order_info.broadcast_type', 'op' => 'eq', 'value' => 'radio'], $values))->toBeFalse();
    expect($eval->evaluate(['field' => 'order_info.broadcast_type', 'op' => 'neq', 'value' => 'tv'], $values))->toBeFalse();
    expect($eval->evaluate(['field' => 'order_info.broadcast_type', 'op' => 'neq', 'value' => 'radio'], $values))->toBeTrue();
});

it('evaluates in operator against arrays', function () {
    $eval = new ConditionEvaluator;
    $rule = ['field' => 'order_info.broadcast_type', 'op' => 'in', 'value' => ['tv', 'radio']];
    expect($eval->evaluate($rule, ['order_info' => ['broadcast_type' => 'tv']]))->toBeTrue();
    expect($eval->evaluate($rule, ['order_info' => ['broadcast_type' => 'radio']]))->toBeTrue();
    expect($eval->evaluate($rule, ['order_info' => ['broadcast_type' => 'digital']]))->toBeFalse();
    expect($eval->evaluate($rule, []))->toBeFalse();
});
