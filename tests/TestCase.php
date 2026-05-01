<?php

namespace Tests;

use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * BffAuth-protected routes need api_token in session; keep Laravel guard in sync for code paths that use $request->user().
     */
    protected function actingAsBff(?User $user = null): static
    {
        $user ??= User::factory()->create();

        return $this->actingAs($user)->withSession([
            'api_token' => 'test-bff-token',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'roles' => [],
            'permissions' => [],
        ]);
    }
}
