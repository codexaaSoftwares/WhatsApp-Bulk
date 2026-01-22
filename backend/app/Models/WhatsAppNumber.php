<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class WhatsAppNumber extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'phone_number_id',
        'access_token',
        'phone_number',
        'display_name',
        'is_active',
        'verified_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
        'verified_at' => 'datetime',
    ];

    /**
     * Get the encrypted access token.
     *
     * @param  string  $value
     * @return string
     */
    public function getAccessTokenAttribute($value)
    {
        try {
            return $value ? Crypt::decryptString($value) : null;
        } catch (\Exception $e) {
            return $value;
        }
    }

    /**
     * Set the encrypted access token.
     *
     * @param  string  $value
     * @return void
     */
    public function setAccessTokenAttribute($value)
    {
        $this->attributes['access_token'] = $value ? Crypt::encryptString($value) : null;
    }

    /**
     * Get the campaigns for this WhatsApp number.
     */
    public function campaigns()
    {
        return $this->hasMany(Campaign::class);
    }

    /**
     * Get the message logs for this WhatsApp number.
     */
    public function messageLogs()
    {
        return $this->hasMany(MessageLog::class);
    }

    /**
     * Scope a query to only include active numbers.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}

