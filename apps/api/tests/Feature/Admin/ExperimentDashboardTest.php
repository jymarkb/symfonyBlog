<?php

use App\Models\User;
use Illuminate\Support\Facades\Storage;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

it('returns 401 for guest', function () {
    $this->getJson('/api/v1/admin/experiments')->assertStatus(401);
});

it('returns 403 for regular user', function () {
    $user = User::factory()->create(['role' => User::ROLE_USER]);
    $this->actingAs($user, 'api')->getJson('/api/v1/admin/experiments')->assertStatus(403);
});

it('returns 200 with empty array when no log exists', function () {
    Storage::fake('local');
    $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
    $response = $this->actingAs($admin, 'api')->getJson('/api/v1/admin/experiments?experiment=auth_gate');
    $response->assertStatus(200);
    $response->assertJson(['data' => []]);
});

it('returns aggregated experiment data for admin', function () {
    Storage::fake('local');
    $logLines = implode("\n", [
        json_encode(['experiment' => 'auth_gate', 'variant' => 'modal',    'event' => 'triggered', 'user_id' => null, 'timestamp' => now()->toISOString()]),
        json_encode(['experiment' => 'auth_gate', 'variant' => 'modal',    'event' => 'converted', 'user_id' => null, 'timestamp' => now()->toISOString()]),
        json_encode(['experiment' => 'auth_gate', 'variant' => 'redirect', 'event' => 'triggered', 'user_id' => null, 'timestamp' => now()->toISOString()]),
    ]);
    Storage::disk('local')->put('logs/experiments.log', $logLines);

    $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
    $response = $this->actingAs($admin, 'api')->getJson('/api/v1/admin/experiments?experiment=auth_gate');
    $response->assertStatus(200);
    $response->assertJsonStructure(['data' => [['variant', 'triggered', 'converted', 'dismissed', 'conversion_rate']]]);
});
