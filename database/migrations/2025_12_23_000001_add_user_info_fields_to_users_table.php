<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('first_name')->nullable()->after('name');
            $table->string('last_name')->nullable()->after('first_name');
            $table->string('organization')->nullable()->after('last_name');
            $table->string('job_title')->nullable()->after('organization');
            $table->string('department')->nullable()->after('job_title');
            $table->string('phone_number')->nullable()->after('department');
            $table->text('about_me')->nullable()->after('phone_number');
            $table->boolean('out_of_office')->default(false)->after('about_me');

            $table->string('profile_photo_path')->nullable()->after('out_of_office');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'first_name',
                'last_name',
                'organization',
                'job_title',
                'department',
                'phone_number',
                'about_me',
                'out_of_office',
                'profile_photo_path',
            ]);
        });
    }
};

