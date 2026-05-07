<?php

use App\Http\Controllers\Api\V1\SessionController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\PublicProfileController;
use App\Http\Controllers\Api\V1\ProfileCommentController;
use App\Http\Controllers\Api\V1\ProfileNotificationController;
use App\Http\Controllers\Api\V1\ProfileReadingHistoryController;
use App\Http\Controllers\Api\V1\Admin\PostController;
use App\Http\Controllers\Api\V1\Admin\UserController;
use App\Http\Controllers\Api\V1\Admin\CommentController;
use App\Http\Controllers\Api\V1\Admin\CategoryController;
use App\Http\Controllers\Api\V1\Admin\UploadController;

Route::prefix('v1')->group(function () {
    Route::get('/posts', fn() => response()->json([]));
    Route::get('/categories', fn() => response()->json([]));
    Route::get('/profiles/{handle}', [PublicProfileController::class, 'show'])->middleware('throttle:public-api');

    Route::middleware(['auth:api', 'no-cache'])->group(function () {
        Route::get('/session', [SessionController::class, 'show'])->middleware('throttle:session');

        Route::get('/profile/reading-history', [ProfileReadingHistoryController::class, 'index'])->middleware('throttle:auth-read');
        Route::get('/profile/comments', [ProfileCommentController::class, 'index'])->middleware('throttle:auth-read');
        Route::patch('/profile/notifications', [ProfileNotificationController::class, 'update'])->middleware('throttle:profile-mutations');
        Route::get('/profile', [ProfileController::class, 'show'])->middleware('throttle:auth-read');
        Route::patch('/profile', [ProfileController::class, 'update'])->middleware('throttle:profile-mutations');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->middleware('throttle:profile-delete');

        Route::middleware('admin')->prefix('admin')->group(function () {
            Route::get('/posts', [PostController::class, 'index'])->middleware('throttle:admin-read');
            Route::post('/posts', [PostController::class, 'store'])->middleware('throttle:admin-mutations');
            Route::patch('/posts/{post}', [PostController::class, 'update'])->middleware('throttle:admin-mutations');
            Route::delete('/posts/{post}', [PostController::class, 'destroy'])->middleware('throttle:admin-mutations');

            Route::get('/users', [UserController::class, 'index'])->middleware('throttle:admin-read');
            Route::patch('/users/{user}', [UserController::class, 'update'])->middleware('throttle:admin-mutations');

            Route::get('/comments', [CommentController::class, 'index'])->middleware('throttle:admin-read');
            Route::patch('/comments/{comment}', [CommentController::class, 'update'])->middleware('throttle:admin-mutations');

            Route::get('/categories', [CategoryController::class, 'index'])->middleware('throttle:admin-read');
            Route::post('/categories', [CategoryController::class, 'store'])->middleware('throttle:admin-mutations');
            Route::patch('/categories/{category}', [CategoryController::class, 'update'])->middleware('throttle:admin-mutations');
            Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->middleware('throttle:admin-mutations');

            Route::post('/uploads', [UploadController::class, 'store'])->middleware('throttle:admin-mutations');
        });
    });

    Route::post('/posts/{slug}/view', fn() => response()->json([], 202))->middleware('throttle:post-view');
});
