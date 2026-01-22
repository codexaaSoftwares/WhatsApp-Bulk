<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WebhookEvent extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'event_type',
        'wa_message_id',
        'payload',
        'processed',
        'processed_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'payload' => 'array',
        'processed' => 'boolean',
        'processed_at' => 'datetime',
    ];

    /**
     * Scope a query to only include unprocessed events.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeUnprocessed($query)
    {
        return $query->where('processed', false);
    }

    /**
     * Scope a query to only include processed events.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeProcessed($query)
    {
        return $query->where('processed', true);
    }

    /**
     * Mark the event as processed.
     *
     * @return void
     */
    public function markAsProcessed()
    {
        $this->update([
            'processed' => true,
            'processed_at' => now(),
        ]);
    }
}

