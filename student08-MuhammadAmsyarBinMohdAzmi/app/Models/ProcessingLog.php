<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProcessingLog extends Model
{
    protected $fillable = [
        'raw_input_id',
        'step_name',
        'status',
        'message',
        'metadata_json',
    ];

    protected $casts = [
        'metadata_json' => 'array',
    ];

    public function rawInput(): BelongsTo
    {
        return $this->belongsTo(RawInput::class, 'raw_input_id');
    }
}