<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    use HasFactory;

    protected $hidden = [
        'user_id',
        'status',
        'body',
    ];

    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'cover_image',
        'reading_time',
        'body',
        'status',
        'is_featured',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'body' => 'array',
            'is_featured' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class)->withTimestamps();
    }

    public function stars(): HasMany
    {
        return $this->hasMany(PostStar::class);
    }

    public function starredByUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'post_stars')->withTimestamps();
    }
}
