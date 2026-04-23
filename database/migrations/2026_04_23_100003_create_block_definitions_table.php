<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('block_definitions', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('name');
            $table->string('kind');
            $table->json('schema');
            $table->json('embeds')->nullable();
            $table->unsignedInteger('version')->default(1);
            $table->timestamps();
            $table->index('kind');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('block_definitions');
    }
};
