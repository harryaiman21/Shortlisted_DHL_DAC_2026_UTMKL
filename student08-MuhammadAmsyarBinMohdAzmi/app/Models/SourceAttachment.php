<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SourceAttachment extends Model
{
protected $fillable = [
    'raw_input_id',
    'file_path',
    'original_name',
    'mime_type',
    'size_bytes',
];
}
