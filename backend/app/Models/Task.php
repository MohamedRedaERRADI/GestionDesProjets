<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'status',
        'due_date',
        'project_id',
        'assignee_id',
        'created_by',
        'priority'
    ];

    protected $casts = [
        'due_date' => 'date',
    ];

    protected $with = ['project', 'assignee'];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
}
