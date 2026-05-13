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
        'bio',
        'first_name',
        'last_name',
        'notify_comment_replies',
        'notify_new_posts',
    ];

    protected $hidden = ['supabase_user_id', 'role', 'email'];

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

    public function postStars(): HasMany
    {
        return $this->hasMany(PostStar::class);
    }

    public function starredPosts()
    {
        return $this->belongsToMany(Post::class, 'post_stars')->withTimestamps();
    }

    public function followers(): HasMany
    {
        return $this->hasMany(AuthorFollow::class, 'author_id');
    }

    public function following(): HasMany
    {
        return $this->hasMany(AuthorFollow::class, 'follower_id');
    }

    protected function casts(): array
    {
        return [
            'supabase_user_id' => 'string',
        ];
    }

}
