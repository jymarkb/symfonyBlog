<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('returns a public profile without authentication', function () {
    $user = User::factory()->create([
        'email' => 'private@example.com',
        'handle' => '@public_reader',
        'display_name' => 'Public Reader',
        'role' => User::ROLE_ADMIN,
        'first_name' => 'Private',
        'last_name' => 'Person',
    ]);

    $this->getJson('/api/v1/profiles/public_reader')
        ->assertOk()
        ->assertJsonPath('data.id', $user->id)
        ->assertJsonPath('data.handle', '@public_reader')
        ->assertJsonPath('data.display_name', 'Public Reader')
        ->assertJsonMissingPath('data.email')
        ->assertJsonMissingPath('data.role')
        ->assertJsonMissingPath('data.supabase_user_id')
        ->assertJsonMissingPath('data.first_name')
        ->assertJsonMissingPath('data.last_name');
});

it('accepts public profile handles with the at sign', function () {
    User::factory()->create([
        'handle' => '@with_symbol',
    ]);

    $this->getJson('/api/v1/profiles/@with_symbol')
        ->assertOk()
        ->assertJsonPath('data.handle', '@with_symbol');
});

it('returns not found for a missing public profile', function () {
    $this->getJson('/api/v1/profiles/missing_handle')
        ->assertNotFound();
});
