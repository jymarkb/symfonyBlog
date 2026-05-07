<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('rejects guests from the notification preferences endpoint', function () {
    $this->patchJson('/api/v1/profile/notifications', [])
        ->assertUnauthorized();
});

it('updates notification preferences for authenticated user', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'api')
        ->patchJson('/api/v1/profile/notifications', [
            'notify_comment_replies' => 'digest',
            'notify_new_posts' => 'immediate',
        ])
        ->assertOk()
        ->assertJsonPath('data.notify_comment_replies', 'digest')
        ->assertJsonPath('data.notify_new_posts', 'immediate');

    expect($user->refresh()->notify_comment_replies)->toBe('digest');
    expect($user->refresh()->notify_new_posts)->toBe('immediate');
});

it('rejects invalid notification preference values', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'api')
        ->patchJson('/api/v1/profile/notifications', [
            'notify_comment_replies' => 'banana',
        ])
        ->assertUnprocessable();
});
