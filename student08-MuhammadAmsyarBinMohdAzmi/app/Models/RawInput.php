<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RawInput extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'source_type',
        'title',
        'original_text',
        'file_path',
        'mime_type',
        'status',
    ];

    public function drafts()
    {
        return $this->hasMany(ArticleDraft::class);
    }

    public function logs()
    {
        return $this->hasMany(ProcessingLog::class);
    }

    public function attachments()
    {
        return $this->hasMany(SourceAttachment::class);
    }
}