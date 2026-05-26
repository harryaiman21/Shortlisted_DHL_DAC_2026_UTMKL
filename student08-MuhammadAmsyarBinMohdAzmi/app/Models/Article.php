<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    protected $fillable = [
        'article_draft_id',
        'title',
        'slug',
        'content_html',
        'tags_json',
        'published_by',
        'published_at',
    ];

    protected $casts = [
        'tags_json' => 'array',
        'published_at' => 'datetime',
    ];

    public function draft()
    {
        return $this->belongsTo(ArticleDraft::class, 'article_draft_id');
    }
}