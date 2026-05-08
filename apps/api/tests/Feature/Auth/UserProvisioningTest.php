<?php

use App\Models\User;
use App\Services\Auth\SupabaseTokenVerifier;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function fakeClaims(array $overrides = []): object
{
    return (object) [
        'sub'           => 'supabase-uuid-' . fake()->uuid(),
        'email'         => fake()->unique()->safeEmail(),
        'user_metadata' => ['display_name' => 'Test User'],
        ...$overrides,
    ];
}

function mockVerifier(object $claims): void
{
    app()->bind(SupabaseTokenVerifier::class, fn () => new class($claims) {
        public function __construct(private readonly object $claims) {}
        public function verify(string $_token): object { return $this->claims; }
    });
}

it('creates a new user on first token verification', function () {
    $claims = fakeClaims();
    mockVerifier($claims);

    $this->getJson('/api/v1/session', ['Authorization' => 'Bearer fake-token'])
        ->assertCreated();

    $user = User::where('supabase_user_id', $claims->sub)->first();
    expect($user)->not->toBeNull()
        ->and($user->email)->toBe($claims->email)
        ->and($user->display_name)->toBe('Test User')
        ->and($user->role)->toBe(User::ROLE_USER);
});

it('does not duplicate an existing user on repeated token verification', function () {
    $claims = fakeClaims();
    mockVerifier($claims);

    $this->getJson('/api/v1/session', ['Authorization' => 'Bearer fake-token'])->assertSuccessful();
    $this->getJson('/api/v1/session', ['Authorization' => 'Bearer fake-token'])->assertSuccessful();

    expect(User::where('supabase_user_id', $claims->sub)->count())->toBe(1);
});

it('truncates display_name from metadata to 120 characters', function () {
    $longName = str_repeat('A', 200);
    $claims   = fakeClaims(['user_metadata' => ['display_name' => $longName]]);
    mockVerifier($claims);

    $this->getJson('/api/v1/session', ['Authorization' => 'Bearer fake-token'])->assertSuccessful();

    $user = User::where('supabase_user_id', $claims->sub)->first();
    expect(mb_strlen($user->display_name))->toBeLessThanOrEqual(120);
});

it('uses full_name as fallback when display_name is absent', function () {
    $claims = fakeClaims(['user_metadata' => ['full_name' => 'Full Name Fallback']]);
    mockVerifier($claims);

    $this->getJson('/api/v1/session', ['Authorization' => 'Bearer fake-token'])->assertSuccessful();

    $user = User::where('supabase_user_id', $claims->sub)->first();
    expect($user->display_name)->toBe('Full Name Fallback');
});

it('appends a numeric suffix when the preferred handle already exists', function () {
    $existingHandle = '@testuser';
    User::factory()->create(['handle' => $existingHandle]);

    $claims = fakeClaims([
        'email'         => 'testuser@example.com',
        'user_metadata' => ['handle' => 'testuser'],
    ]);
    mockVerifier($claims);

    $this->getJson('/api/v1/session', ['Authorization' => 'Bearer fake-token'])->assertCreated();

    $newUser = User::where('supabase_user_id', $claims->sub)->first();
    expect($newUser->handle)->not->toBe($existingHandle)
        ->and($newUser->handle)->toStartWith('@testuser');
});

it('returns null (401) when the token is invalid', function () {
    app()->bind(SupabaseTokenVerifier::class, fn () => new class {
        public function verify(string $_token): object
        {
            throw new \RuntimeException('Invalid token.');
        }
    });

    $this->getJson('/api/v1/session', ['Authorization' => 'Bearer bad-token'])
        ->assertUnauthorized();
});

it('returns null (401) when no bearer token is provided', function () {
    $this->getJson('/api/v1/session')
        ->assertUnauthorized();
});
