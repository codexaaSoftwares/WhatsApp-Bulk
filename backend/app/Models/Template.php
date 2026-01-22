<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Template extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'language',
        'category',
        'body',
        'header_type',
        'header_content',
        'footer',
        'buttons',
        'variables',
        'status',
        'meta_template_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'buttons' => 'array',
        'variables' => 'array',
    ];

    /**
     * Get the campaigns using this template.
     */
    public function campaigns()
    {
        return $this->hasMany(Campaign::class);
    }

    /**
     * Get the message logs using this template.
     */
    public function messageLogs()
    {
        return $this->hasMany(MessageLog::class);
    }

    /**
     * Scope a query to only include approved templates.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'APPROVED');
    }

    /**
     * Scope a query to only include active templates.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['APPROVED', 'PENDING']);
    }
}

