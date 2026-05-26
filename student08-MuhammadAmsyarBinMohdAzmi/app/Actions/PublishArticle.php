<?php

namespace App\Actions;

use App\Models\Article;
use App\Models\ArticleDraft;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class PublishArticle
{
    public function execute(ArticleDraft $draft, array $validatedData): Article
    {
        return DB::transaction(function () use ($draft, $validatedData) {
            // 1. Convert JSON body to HTML for the final article
            $htmlContent = $this->convertToHtml($validatedData['body_json']);

            // 2. Create the final Article
            $article = Article::create([
                'article_draft_id' => $draft->id,
                'title'            => $validatedData['title'],
                'slug'             => Str::slug($validatedData['title']) . '-' . Str::random(5),
                'content_html'     => $htmlContent,
                'tags_json'        => $validatedData['tags'] ?? [],
                'published_by'     => auth()->id(),
                'published_at'     => now(),
            ]);

            // 3. Update Draft status and reviewer
            $draft->update([
                'status'      => 'published',
                'reviewed_by' => auth()->id(),
            ]);

            // 4. Mark the Raw Input as complete
            $draft->rawInput->update(['status' => 'completed']);

            return $article;
        });
    }

    /**
     * Converts your JSON sections into clean HTML.
     */
    private function convertToHtml(array $bodyJson): string
    {
        $html = "";
        foreach ($bodyJson['sections'] ?? [] as $section) {
            $html .= "<h3>" . e($section['heading']) . "</h3>";
            $html .= "<ul>";
            foreach ($section['content'] as $step) {
                $html .= "<li>" . e($step) . "</li>";
            }
            $html .= "</ul>";
        }
        return $html;
    }
}