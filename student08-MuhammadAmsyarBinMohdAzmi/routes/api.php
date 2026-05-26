<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RpaIngestController;

// Change /ingest to /raw-input to match our previous steps
// Remove the 'auth:sanctum' middleware so UiPath can access it
Route::post('/raw-input', [RpaIngestController::class, 'store']);