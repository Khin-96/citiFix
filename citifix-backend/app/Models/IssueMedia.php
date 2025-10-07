<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IssueMedia extends Model
{
    use HasFactory;

    protected $table = 'issue_media';

    protected $fillable = [
        'issue_id',
        'file_path',
        'file_name',
        'mime_type',
        'file_size',
        'type',
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    protected $appends = ['url'];

    public function issue()
    {
        return $this->belongsTo(Issue::class);
    }

    public function getUrlAttribute()
    {
        return asset('storage/' . $this->file_path);
    }
}
