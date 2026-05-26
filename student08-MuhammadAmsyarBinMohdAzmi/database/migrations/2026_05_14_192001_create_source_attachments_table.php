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
    Schema::create('source_attachments', function (Blueprint $table) {
        $table->id();
        $table->foreignId('raw_input_id')->constrained()->onDelete('cascade');
        
        $table->string('file_path');
        $table->string('original_name');
        $table->string('mime_type');
        $table->unsignedBigInteger('size_bytes');
        
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('source_attachments');
    }
};
