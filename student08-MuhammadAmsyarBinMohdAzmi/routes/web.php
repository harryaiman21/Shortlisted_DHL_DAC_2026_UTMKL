<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DraftReviewController; // Updated this
use App\Http\Controllers\ArticleController;
use App\Models\ArticleDraft;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::view('/upload', 'upload')->name('upload');
    Route::view('/inbox', 'inbox')->name('inbox');
    
    // Draft Management
    Route::get('/drafts', [DraftReviewController::class, 'index'])->name('drafts.index');
    Route::get('/drafts/{draft}', function (ArticleDraft $draft) {
        return view('draft-editor', compact('draft'));
    })->name('drafts.show');
    
    // The missing link: The Publish Action
    Route::post('/drafts/{draft}/publish', [DraftReviewController::class, 'publish'])->name('drafts.publish');

    Route::get('/articles', [ArticleController::class, 'index'])->name('articles.index');
    Route::get('/articles/{article}', [ArticleController::class, 'show'])->name('articles.show');

    Route::get('/logs', [\App\Http\Controllers\ProcessingLogController::class, 'index'])->name('logs.index');

    Route::view('/profile', 'profile')->name('profile');
});

require __DIR__ . '/auth.php';