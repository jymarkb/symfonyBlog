<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop the old two-column unique constraint if it still exists.
        // It may have already been dropped if this migration was previously
        // run under a different filename.
        $driver = DB::getDriverName();

        if ($driver === 'pgsql') {
            $exists = DB::selectOne("
                SELECT 1 FROM pg_constraint
                WHERE conname = 'post_reactions_post_id_user_id_unique'
                  AND conrelid = 'post_reactions'::regclass
            ");
            if ($exists) {
                DB::statement('ALTER TABLE post_reactions DROP CONSTRAINT post_reactions_post_id_user_id_unique');
            }
        } elseif ($driver === 'mysql' || $driver === 'mariadb') {
            $exists = DB::selectOne("
                SELECT 1 FROM information_schema.statistics
                WHERE table_schema = DATABASE()
                  AND table_name = 'post_reactions'
                  AND index_name = 'post_reactions_post_id_user_id_unique'
                LIMIT 1
            ");
            if ($exists) {
                DB::statement('ALTER TABLE post_reactions DROP INDEX post_reactions_post_id_user_id_unique');
            }
        } else {
            // SQLite used in testing — attempt silently
            try {
                Schema::table('post_reactions', function (Blueprint $table) {
                    $table->dropUnique(['post_id', 'user_id']);
                });
            } catch (\Throwable) {
                // Already dropped; continue.
            }
        }

        // Add the new per-type unique constraint if it does not yet exist.
        if ($driver === 'pgsql') {
            $newExists = DB::selectOne("
                SELECT 1 FROM pg_constraint
                WHERE conname = 'post_reactions_post_user_reaction_unique'
                  AND conrelid = 'post_reactions'::regclass
            ");
            if (! $newExists) {
                DB::statement('ALTER TABLE post_reactions ADD CONSTRAINT post_reactions_post_user_reaction_unique UNIQUE (post_id, user_id, reaction)');
            }
        } elseif ($driver === 'mysql' || $driver === 'mariadb') {
            $newExists = DB::selectOne("
                SELECT 1 FROM information_schema.statistics
                WHERE table_schema = DATABASE()
                  AND table_name = 'post_reactions'
                  AND index_name = 'post_reactions_post_user_reaction_unique'
                LIMIT 1
            ");
            if (! $newExists) {
                Schema::table('post_reactions', function (Blueprint $table) {
                    $table->unique(['post_id', 'user_id', 'reaction'], 'post_reactions_post_user_reaction_unique');
                });
            }
        } else {
            // SQLite
            try {
                Schema::table('post_reactions', function (Blueprint $table) {
                    $table->unique(['post_id', 'user_id', 'reaction'], 'post_reactions_post_user_reaction_unique');
                });
            } catch (\Throwable) {
                // Already exists; continue.
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('post_reactions', function (Blueprint $table) {
            $table->dropUnique('post_reactions_post_user_reaction_unique');
            $table->unique(['post_id', 'user_id']);
        });
    }
};
