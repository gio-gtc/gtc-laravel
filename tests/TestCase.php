<?php

namespace Tests;

use Illuminate\Auth\GenericUser;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Mock the BFF session state without touching a database.
     */
    protected function actingAsBff(array $overrides = []): static
    {
        $userData = array_merge([
            'id' => 1,
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
        ], $overrides);

        return $this->withSession([
            'api_token' => 'test-bff-token',
            'user' => $userData,
            'roles' => [],
            'permissions' => [],
        ]);
    }
}