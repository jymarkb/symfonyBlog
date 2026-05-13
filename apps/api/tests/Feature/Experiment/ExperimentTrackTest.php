<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

$validPayload = [
    'experiment' => 'auth_gate_modal',
    'variant'    => 'modal',
    'event'      => 'triggered',
];

it('returns 202 for a valid guest payload', function () use (&$validPayload) {
    Storage::fake('local');

    $this->postJson('/api/v1/experiments/track', $validPayload)
        ->assertStatus(202);
});

it('returns 202 for a valid authenticated payload', function () use (&$validPayload) {
    Storage::fake('local');

    $user = User::factory()->create();

    $this->actingAs($user, 'api')
        ->postJson('/api/v1/experiments/track', $validPayload)
        ->assertStatus(202);
});

it('returns 422 for an invalid event value', function () use (&$validPayload) {
    $this->postJson('/api/v1/experiments/track', array_merge($validPayload, ['event' => 'invalid_event']))
        ->assertStatus(422)
        ->assertJsonValidationErrors(['event']);
});

it('returns 422 for an invalid variant value', function () use (&$validPayload) {
    $this->postJson('/api/v1/experiments/track', array_merge($validPayload, ['variant' => 'unknown']))
        ->assertStatus(422)
        ->assertJsonValidationErrors(['variant']);
});

it('returns 422 when experiment field is missing', function () use (&$validPayload) {
    $payload = $validPayload;
    unset($payload['experiment']);

    $this->postJson('/api/v1/experiments/track', $payload)
        ->assertStatus(422)
        ->assertJsonValidationErrors(['experiment']);
});
