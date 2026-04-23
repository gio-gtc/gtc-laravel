<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('form_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_submission_id')->constrained()->cascadeOnDelete();
            $table->foreignId('venue_id')->constrained()->cascadeOnDelete();
            $table->string('block_key');
            $table->string('field_key');
            $table->string('field_type');
            $table->string('value_text', 500)->nullable();
            $table->decimal('value_number', 18, 4)->nullable();
            $table->date('value_date')->nullable();
            $table->boolean('value_bool')->nullable();
            $table->string('value_file_path')->nullable();
            $table->timestamps();

            $table->index(['venue_id', 'block_key', 'field_key']);
            $table->index(['field_key', 'value_number']);
            $table->index(['field_key', 'value_text']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('form_answers');
    }
};
