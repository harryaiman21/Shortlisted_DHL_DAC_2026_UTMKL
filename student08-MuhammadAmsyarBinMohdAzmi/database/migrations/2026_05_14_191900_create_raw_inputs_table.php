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
    Schema::create('raw_inputs', function (Blueprint $table) {
        $table->id();
        
        // The missing link causing your error:
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        
        // Other columns required by your Livewire component:
        $table->string('source_type');
        $table->string('title')->nullable();
        $table->text('original_text')->nullable();
        $table->string('file_path')->nullable();
        $table->string('mime_type')->nullable();
        $table->string('status')->default('new');
        
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('raw_inputs');
    }
};
