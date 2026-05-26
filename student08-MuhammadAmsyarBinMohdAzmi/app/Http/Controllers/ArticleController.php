<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;
use Barrier\DomPDF\Facade\Pdf;

class ArticleController extends Controller
{
    public function index(Request $request)
    {
        $search = trim((string) $request->query('search', ''));

        $articles = Article::with(['draft.rawInput'])
            ->latest('published_at')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('content_html', 'like', "%{$search}%");
                });
            })
            ->paginate(12)
            ->withQueryString();

        return view('articles', compact('articles', 'search'));
    }

public function downloadPdf(Article $article)
{
    $pdf = Pdf::loadView('pdf.article', compact('article'));
    return $pdf->download($article->slug . '.pdf');
}

    public function show(Article $article)
    {
        $article->load(['draft.rawInput']);

        return view('article-show', compact('article'));
    }
}