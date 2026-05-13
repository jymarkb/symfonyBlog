<?php

use App\Http\Controllers\Api\V1\SessionController;
use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\PostController as PublicPostController;
use App\Http\Controllers\Api\V1\PostUserStateController;
use App\Http\Controllers\Api\V1\PostReactionController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\PublicProfileController;
use App\Http\Controllers\Api\V1\ProfileCommentController;
use App\Http\Controllers\Api\V1\ProfileNotificationController;
use App\Http\Controllers\Api\V1\ProfileReadingHistoryController;
use App\Http\Controllers\Api\V1\TagController as PublicTagController;
use App\Http\Controllers\Api\V1\Admin\PostController;
use App\Http\Controllers\Api\V1\Admin\UserController;
use App\Http\Controllers\Api\V1\Admin\CommentController;
use App\Http\Controllers\Api\V1\Admin\TagController;
use App\Http\Controllers\Api\V1\Admin\UploadController;

Route::prefix('v1')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Public routes — no authentication required
    |--------------------------------------------------------------------------
    | Every route NOT listed here is protected by the global RequireAuth
    | middleware appended to the api group. Opt-outs must be explicit.
    */
    Route::withoutMiddleware(Authenticate::using('api'))->group(function () {
        Route::get('/posts', [PublicPostController::class, 'index'])->middleware('throttle:public-api');
        Route::get('/posts/years', [PublicPostController::class, 'years'])->middleware('throttle:public-api');
        Route::get('/posts/{slug}', [PublicPostController::class, 'show'])->middleware('throttle:public-api');
        Route::get('/tags', [PublicTagController::class, 'index'])->middleware('throttle:public-api');
        Route::get('/profiles/{handle}', [PublicProfileController::class, 'show'])->middleware('throttle:public-api');
        Route::post('/posts/{slug}/view', fn() => response()->json([], 202))->middleware('throttle:post-view');
    });

    /*
    |--------------------------------------------------------------------------
    | Authenticated routes — protected by default (global RequireAuth)
    |--------------------------------------------------------------------------
    */
    Route::middleware('no-cache')->group(function () {
        Route::get('/session', [SessionController::class, 'show'])->middleware('throttle:session');

        Route::get('/profile/reading-history', [ProfileReadingHistoryController::class, 'index'])->middleware('throttle:auth-read');
        Route::get('/profile/comments', [ProfileCommentController::class, 'index'])->middleware('throttle:auth-read');
        Route::patch('/profile/notifications', [ProfileNotificationController::class, 'update'])->middleware('throttle:profile-mutations');
        Route::get('/profile', [ProfileController::class, 'show'])->middleware('throttle:auth-read');
        Route::patch('/profile', [ProfileController::class, 'update'])->middleware('throttle:profile-mutations');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->middleware('throttle:profile-delete');

        Route::get('/posts/{slug}/me', [PostUserStateController::class, 'show'])->middleware('throttle:auth-read');
        Route::post('/posts/{slug}/reactions', [PostReactionController::class, 'store'])->middleware('throttle:profile-mutations');

        Route::post('/authors/{authorId}/follow', [\App\Http\Controllers\Api\V1\AuthorFollowController::class, 'store'])->middleware('throttle:profile-mutations');
        Route::delete('/authors/{authorId}/follow', [\App\Http\Controllers\Api\V1\AuthorFollowController::class, 'destroy'])->middleware('throttle:profile-mutations');

        /*
        |----------------------------------------------------------------------
        | Admin routes — authenticated + admin permission required
        |----------------------------------------------------------------------
        */
        Route::middleware('permission:admin')->prefix('admin')->group(function () {
            Route::get('/posts', [PostController::class, 'index'])->middleware('throttle:admin-read');
            Route::post('/posts', [PostController::class, 'store'])->middleware('throttle:admin-mutations');
            Route::patch('/posts/{post}', [PostController::class, 'update'])->middleware('throttle:admin-mutations');
            Route::delete('/posts/{post}', [PostController::class, 'destroy'])->middleware('throttle:admin-mutations');

            Route::get('/users', [UserController::class, 'index'])->middleware('throttle:admin-read');
            Route::patch('/users/{user}', [UserController::class, 'update'])->middleware('throttle:admin-mutations');

            Route::get('/comments', [CommentController::class, 'index'])->middleware('throttle:admin-read');
            Route::patch('/comments/{comment}', [CommentController::class, 'update'])->middleware('throttle:admin-mutations');

            Route::get('/tags', [TagController::class, 'index'])->middleware('throttle:admin-read');
            Route::post('/tags', [TagController::class, 'store'])->middleware('throttle:admin-mutations');
            Route::patch('/tags/{tag}', [TagController::class, 'update'])->middleware('throttle:admin-mutations');
            Route::delete('/tags/{tag}', [TagController::class, 'destroy'])->middleware('throttle:admin-mutations');

            Route::post('/uploads', [UploadController::class, 'store'])->middleware('throttle:admin-mutations');
        });
    });

});
