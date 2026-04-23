<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('item_catalog', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('name');
            $table->string('platform')->nullable();
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->string('unit')->default('px');
            $table->json('meta')->nullable();
            $table->timestamps();
            $table->index('platform');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('item_catalog');
    }
};
