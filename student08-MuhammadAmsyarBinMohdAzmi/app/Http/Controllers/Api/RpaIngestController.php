<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RawInput;
use App\Actions\ProcessRawInput; // Namespace must match your file's "namespace" line

class RpaIngestController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'text'  => 'required|string',
            'source' => 'required|string',
        ]);

        $rawInput = RawInput::create([
            'user_id'       => 1, 
            'source_type'   => $validated['source'],
            'title'         => $validated['title'],
            'original_text' => $validated['text'],
            'status'        => 'new'
        ]);

        // Since it's now a Job, use dispatch
        ProcessRawInput::dispatch($rawInput); 

        return response()->json([
            'status' => 'Success',
            'id' => $rawInput->id
        ], 201);
    }
}