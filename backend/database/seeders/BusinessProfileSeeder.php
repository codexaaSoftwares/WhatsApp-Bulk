<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BusinessProfile;

class BusinessProfileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        BusinessProfile::updateOrCreate(
            ['id' => 1],
            [
                'business_name' => 'My Business',
                'whatsapp_business_id' => null,
                'app_id' => null,
                'phone_number_id' => null,
            ]
        );
    }
}

