<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'whatsapp_number_id',
        'template_id',
        'total_messages',
        'sent_count',
        'delivered_count',
        'read_count',
        'failed_count',
        'status',
        'started_at',
        'completed_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /**
     * Get the WhatsApp number for this campaign.
     */
    public function whatsappNumber()
    {
        return $this->belongsTo(WhatsAppNumber::class);
    }

    /**
     * Get the template for this campaign.
     */
    public function template()
    {
        return $this->belongsTo(Template::class);
    }

    /**
     * Get the message logs for this campaign.
     */
    public function messageLogs()
    {
        return $this->hasMany(MessageLog::class);
    }

    /**
     * Calculate and update campaign statistics.
     *
     * @return void
     */
    public function updateStatistics()
    {
        $this->total_messages = $this->messageLogs()->count();
        $this->sent_count = $this->messageLogs()->where('status', '!=', 'PENDING')->count();
        $this->delivered_count = $this->messageLogs()->whereIn('status', ['DELIVERED', 'READ'])->count();
        $this->read_count = $this->messageLogs()->where('status', 'READ')->count();
        $this->failed_count = $this->messageLogs()->where('status', 'FAILED')->count();
        $this->save();
    }

    /**
     * Get delivery percentage.
     *
     * @return float
     */
    public function getDeliveryPercentageAttribute()
    {
        if ($this->total_messages == 0) {
            return 0;
        }

        return round(($this->delivered_count / $this->total_messages) * 100, 2);
    }

    /**
     * Get failure percentage.
     *
     * @return float
     */
    public function getFailurePercentageAttribute()
    {
        if ($this->total_messages == 0) {
            return 0;
        }

        return round(($this->failed_count / $this->total_messages) * 100, 2);
    }
}

