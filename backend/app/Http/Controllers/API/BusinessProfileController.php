<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\BusinessProfile;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class BusinessProfileController extends Controller
{
    /**
     * Get business profile.
     */
    public function index(): JsonResponse
    {
        try {
            $profile = BusinessProfile::first();

            if (!$profile) {
                // Create default profile if doesn't exist
                $profile = BusinessProfile::create([
                    'business_name' => 'My Business',
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => $profile
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch business profile', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch business profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update business profile.
     */
    public function update(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'business_name' => 'required|string|max:255',
            'whatsapp_business_id' => 'nullable|string|max:255',
            'app_id' => 'nullable|string|max:255',
            'phone_number_id' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $profile = BusinessProfile::first();

            if (!$profile) {
                $profile = BusinessProfile::create($request->all());
            } else {
                $profile->update($request->all());
            }

            Log::info('Business profile updated', ['profile_id' => $profile->id]);

            return response()->json([
                'success' => true,
                'message' => 'Business profile updated successfully',
                'data' => $profile->fresh()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update business profile', [
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update business profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
