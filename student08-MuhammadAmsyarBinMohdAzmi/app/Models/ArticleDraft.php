<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ArticleDraft extends Model
{
    protected $fillable = [
        'raw_input_id',
        'title',
        'summary',
        'body_json',
        'confidence_score',
        'status',
        'created_by',
        'reviewed_by',
    ];

    protected $casts = [
        'body_json' => 'array',
        'confidence_score' => 'float',
    ];

    public function rawInput()
    {
        return $this->belongsTo(RawInput::class, 'raw_input_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function article()
    {
        return $this->hasOne(Article::class, 'article_draft_id');
    }
}