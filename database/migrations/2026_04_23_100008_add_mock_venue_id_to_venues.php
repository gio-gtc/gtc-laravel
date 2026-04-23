<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('venues', function (Blueprint $table) {
            $table->unsignedBigInteger('mock_venue_id')->nullable()->after('slug');
            $table->unique('mock_venue_id');
        });
    }

    public function down(): void
    {
        Schema::table('venues', function (Blueprint $table) {
            $table->dropUnique(['mock_venue_id']);
            $table->dropColumn('mock_venue_id');
        });
    }
};
