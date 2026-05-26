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
    Schema::create('article_drafts', function (Blueprint $table) {
        $table->id();
        // Foreign key to raw_inputs
        $table->foreignId('raw_input_id')->constrained()->onDelete('cascade');
        
        $table->string('title');
        $table->text('summary')->nullable();
        $table->json('body_json'); // Matches the 'array' cast in model
        $table->float('confidence_score')->default(0);
        $table->string('status')->default('draft');
        
        // Foreign keys to users
        $table->foreignId('created_by')->constrained('users');
        $table->foreignId('reviewed_by')->nullable()->constrained('users');
        
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('article_drafts');
    }
};
