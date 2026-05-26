<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\ArticleDraft;
use App\Models\ProcessingLog;
use App\Models\RawInput;

class DashboardController extends Controller
{
    public function index()
    {
        return view('dashboard', [
            'rawInputs' => RawInput::count(),
            'drafts' => ArticleDraft::count(),
            'publishedArticles' => Article::count(),
            'failedLogs' => ProcessingLog::where('status', 'failed')->count(),
        ]);
    }
}