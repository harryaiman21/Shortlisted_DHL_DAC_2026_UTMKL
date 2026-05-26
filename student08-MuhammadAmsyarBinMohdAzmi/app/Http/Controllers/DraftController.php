<?php

namespace App\Http\Controllers;

use App\Models\ArticleDraft;
use Illuminate\Http\Request;

class DraftController extends Controller
{
    public function index(Request $request)
    {
        $search = trim((string) $request->query('search', ''));

        $drafts = ArticleDraft::with(['rawInput', 'article'])
            ->latest()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('summary', 'like', "%{$search}%")
                      ->orWhereHas('rawInput', function ($rawQuery) use ($search) {
                          $rawQuery->where('title', 'like', "%{$search}%")
                                   ->orWhere('source_type', 'like', "%{$search}%");
                      });
                });
            })
            ->paginate(12)
            ->withQueryString();

        return view('drafts', compact('drafts', 'search'));
    }
}