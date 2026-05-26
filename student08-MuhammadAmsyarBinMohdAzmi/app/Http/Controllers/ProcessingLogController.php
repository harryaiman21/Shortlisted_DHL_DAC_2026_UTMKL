<?php

namespace App\Http\Controllers;

use App\Models\ProcessingLog; // This imports the model correctly
use Illuminate\Http\Request;

class ProcessingLogController extends Controller
{
    public function index(Request $request)
    {
        $search = trim((string) $request->query('search', ''));

        $logs = ProcessingLog::with('rawInput')
            ->latest()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('step_name', 'like', "%{$search}%")
                      ->orWhere('status', 'like', "%{$search}%")
                      ->orWhere('message', 'like', "%{$search}%")
                      ->orWhereHas('rawInput', function ($rawQuery) use ($search) {
                          $rawQuery->where('title', 'like', "%{$search}%")
                                   ->orWhere('source_type', 'like', "%{$search}%");
                      });
                });
            })
            ->paginate(15)
            ->withQueryString();

        return view('logs', compact('logs', 'search'));
    }
}