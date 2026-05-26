<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\ArticleDraft;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class DraftReviewController extends Controller
{
    /**
     * Display a list of pending drafts.
     */
public function index(Request $request)
{
    $search = $request->input('search');

    $drafts = ArticleDraft::with('rawInput')
                ->where('status', 'generated')
                ->when($search, function ($query, $search) {
                    return $query->where('title', 'like', "%{$search}%");
                })
                ->latest()
                ->paginate(12); // Change ->get() to ->paginate(12)

    return view('drafts', compact('drafts', 'search'));
}

    /**
     * Promote a draft to a live Article.
     */
    public function publish(ArticleDraft $draft)
    {
        // 1. Convert the JSON sections from the draft into HTML for the Article
        $htmlContent = "";
        if (isset($draft->body_json['sections'])) {
            foreach ($draft->body_json['sections'] as $section) {
                $htmlContent .= "<h3>{$section['heading']}</h3>";
                $htmlContent .= "<ul>";
                foreach ($section['content'] as $step) {
                    $htmlContent .= "<li>" . e($step) . "</li>";
                }
                $htmlContent .= "</ul>";
            }
        }

        // 2. Create the official Article
        Article::create([
            'article_draft_id' => $draft->id,
            'title'            => $draft->title,
            'slug'             => Str::slug($draft->title) . '-' . uniqid(),
            'content_html'     => $htmlContent,
            'tags_json'        => ['rpa-ingest', $draft->rawInput->source_type],
            'published_by'     => Auth::id(),
            'published_at'     => now(),
        ]);

        // 3. Update Draft status so it leaves the "Pending" list
        $draft->update(['status' => 'published']);

        return redirect()->route('drafts.index')->with('success', 'SOP Published to Knowledge Base!');
    }
}