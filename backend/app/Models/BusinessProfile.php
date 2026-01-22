<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BusinessProfile extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'business_name',
        'whatsapp_business_id',
        'app_id',
        'phone_number_id',
    ];

    /**
     * Get the business profile (singleton pattern - only one profile).
     *
     * @return BusinessProfile|null
     */
    public static function getProfile()
    {
        return static::first();
    }
}

