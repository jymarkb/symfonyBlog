<?php

use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/posts', fn () => response()->json([]));
    Route::get('/categories', fn () => response()->json([]));

    Route::middleware('auth:api')->group(function () {
        Route::get('/me', \App\Http\Controllers\Api\V1\CurrentUserController::class);

        Route::middleware('admin')->prefix('admin')->group(function () {
            Route::get('/posts', fn () => response()->json([]));
            Route::post('/posts', fn () => response()->json([], 201));
            Route::put('/posts/{post}', fn () => response()->json([]));
            Route::delete('/posts/{post}', fn () => response()->json([], 204));
            Route::post('/uploads', fn () => response()->json([], 201));
        });
    });

    Route::post('/posts/{slug}/view', fn () => response()->json([], 202));
});
