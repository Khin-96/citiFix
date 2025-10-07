<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Issue extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'reporter_id',
        'title',
        'description',
        'category',
        'latitude',
        'longitude',
        'address',
        'status',
        'votes_count',
        'assigned_to',
        'parent_issue_id',
        'is_duplicate',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'votes_count' => 'integer',
        'is_duplicate' => 'boolean',
    ];

    protected $appends = ['user_has_voted'];

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function assignedOfficer()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function media()
    {
        return $this->hasMany(IssueMedia::class);
    }

    public function votes()
    {
        return $this->hasMany(IssueVote::class);
    }

    public function comments()
    {
        return $this->hasMany(IssueComment::class);
    }

    public function parentIssue()
    {
        return $this->belongsTo(Issue::class, 'parent_issue_id');
    }

    public function duplicates()
    {
        return $this->hasMany(Issue::class, 'parent_issue_id');
    }

    public function getUserHasVotedAttribute()
    {
        if (!auth()->check()) {
            return false;
        }
        
        return $this->votes()->where('user_id', auth()->id())->exists();
    }

    public function scopeNearby($query, $latitude, $longitude, $radiusInKm = 1)
    {
        // Haversine formula for finding nearby issues
        $haversine = "(6371 * acos(cos(radians(?)) 
                     * cos(radians(latitude)) 
                     * cos(radians(longitude) - radians(?)) 
                     + sin(radians(?)) 
                     * sin(radians(latitude))))";
        
        return $query
            ->selectRaw("*, {$haversine} AS distance", [$latitude, $longitude, $latitude])
            ->whereRaw("{$haversine} < ?", [$latitude, $longitude, $latitude, $radiusInKm])
            ->orderBy('distance');
    }
}
