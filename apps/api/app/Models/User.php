<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\PostView;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    public const ROLE_USER = 'user';
    public const ROLE_ADMIN = 'admin';

    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'display_name',
        'first_name',
        'last_name',
        'avatar_url',
        'notify_comment_replies',
        'notify_new_posts',
    ];

    protected $hidden = ['supabase_user_id', 'role'];

    public function posts()
    {
        return $this->hasMany(Post::class);
    }
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
    public function postViews(): HasMany
    {
        return $this->hasMany(PostView::class);
    }

    protected function casts(): array
    {
        return [
            'supabase_user_id' => 'string',
        ];
    }

}
