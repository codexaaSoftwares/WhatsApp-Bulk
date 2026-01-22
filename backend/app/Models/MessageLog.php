<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MessageLog extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'campaign_id',
        'contact_id',
        'whatsapp_number_id',
        'template_id',
        'wa_message_id',
        'mobile_number',
        'message_content',
        'status',
        'error_message',
        'sent_at',
        'delivered_at',
        'read_at',
        'failed_at',
        'retry_count',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'read_at' => 'datetime',
        'failed_at' => 'datetime',
    ];

    /**
     * Get the campaign for this message log.
     */
    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }

    /**
     * Get the contact for this message log.
     */
    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    /**
     * Get the WhatsApp number for this message log.
     */
    public function whatsappNumber()
    {
        return $this->belongsTo(WhatsAppNumber::class);
    }

    /**
     * Get the template for this message log.
     */
    public function template()
    {
        return $this->belongsTo(Template::class);
    }

    /**
     * Scope a query to only include messages by status.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $status
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include failed messages.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'FAILED');
    }

    /**
     * Scope a query to only include pending messages.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePending($query)
    {
        return $query->where('status', 'PENDING');
    }
}

