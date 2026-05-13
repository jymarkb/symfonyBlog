<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('author_follows', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('follower_id');
            $table->unsignedBigInteger('author_id');
            $table->timestamps();

            $table->foreign('follower_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('author_id')->references('id')->on('users')->cascadeOnDelete();

            $table->unique(['follower_id', 'author_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('author_follows');
    }
};
