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
    Route::get('/profiles/{handle}', [PublicProfileController::class, 'show']);

    Route::middleware('auth:api')->group(function () {
        Route::get('/session', [SessionController::class, 'show']);

        Route::get('/profile/reading-history', [ProfileReadingHistoryController::class, 'index']);
        Route::get('/profile/comments', [ProfileCommentController::class, 'index']);
        Route::patch('/profile/notifications', [ProfileNotificationController::class, 'update'])->middleware('throttle:profile-mutations');
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::patch('/profile', [ProfileController::class, 'update'])->middleware('throttle:profile-mutations');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->middleware('throttle:profile-delete');

        Route::middleware('admin')->prefix('admin')->group(function () {
            Route::get('/posts', [PostController::class, 'index']);
            Route::post('/posts', [PostController::class, 'store']);
            Route::patch('/posts/{post}', [PostController::class, 'update']);
            Route::delete('/posts/{post}', [PostController::class, 'destroy']);

            Route::get('/users', [UserController::class, 'index']);
            Route::patch('/users/{user}', [UserController::class, 'update']);

            Route::get('/comments', [CommentController::class, 'index']);
            Route::patch('/comments/{comment}', [CommentController::class, 'update']);

            Route::get('/categories', [CategoryController::class, 'index']);
            Route::post('/categories', [CategoryController::class, 'store']);
            Route::patch('/categories/{category}', [CategoryController::class, 'update']);
            Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

            Route::post('/uploads', [UploadController::class, 'store']);
        });
    });

    Route::post('/posts/{slug}/view', fn() => response()->json([], 202))->middleware('throttle:post-view');
});
