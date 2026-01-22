<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'mobile_number',
        'email',
        'notes',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the message logs for this contact.
     */
    public function messageLogs()
    {
        return $this->hasMany(MessageLog::class);
    }

    /**
     * Scope a query to only include active contacts.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Format mobile number to E.164 format.
     *
     * @param  string  $value
     * @return void
     */
    public function setMobileNumberAttribute($value)
    {
        // Remove all non-numeric characters except +
        $cleaned = preg_replace('/[^0-9+]/', '', $value);
        
        // If doesn't start with +, assume it needs country code (you can customize this)
        if (!str_starts_with($cleaned, '+')) {
            // Default: add + if not present (you might want to add default country code)
            // For now, just ensure it's clean
            $this->attributes['mobile_number'] = $cleaned;
        } else {
            $this->attributes['mobile_number'] = $cleaned;
        }
    }
}

