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
    Schema::create('articles', function (Blueprint $table) {
        $table->id();
        // Relationship to the draft it originated from
        $table->foreignId('article_draft_id')->constrained()->onDelete('cascade');
        
        $table->string('title');
        $table->string('slug')->unique();
        $table->mediumText('content_html');
        $table->json('tags_json')->nullable(); // Matches 'array' cast
        
        // Tracking publication
        $table->foreignId('published_by')->nullable()->constrained('users');
        $table->timestamp('published_at')->nullable();
        
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
