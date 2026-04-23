<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('form_submissions', function (Blueprint $table) {
            // Mock orders / tour_venues tables don't exist yet, so these are
            // stored as plain indexed columns without FK constraints. When the
            // real tables land, a follow-up migration can add the constraints.
            $table->unsignedBigInteger('order_id')->nullable()->after('venue_id');
            $table->unsignedBigInteger('tour_venue_id')->nullable()->after('order_id');
            $table->index('order_id');
            $table->index('tour_venue_id');
        });
    }

    public function down(): void
    {
        Schema::table('form_submissions', function (Blueprint $table) {
            $table->dropIndex(['order_id']);
            $table->dropIndex(['tour_venue_id']);
            $table->dropColumn(['order_id', 'tour_venue_id']);
        });
    }
};
