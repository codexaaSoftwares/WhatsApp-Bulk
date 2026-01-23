<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\WhatsAppNumber;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class WhatsAppNumberController extends Controller
{
    protected $whatsappService;

    public function __construct(WhatsAppService $whatsappService)
    {
        $this->whatsappService = $whatsappService;
    }

    /**
     * Display a listing of WhatsApp numbers.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = WhatsAppNumber::query();

            // Filter by active status
            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            // Sort
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginate
            $perPage = $request->get('per_page', 15);
            $numbers = $query->paginate($perPage);

            // Don't expose access token in response
            $numbers->getCollection()->transform(function ($number) {
                return [
                    'id' => $number->id,
                    'phone_number_id' => $number->phone_number_id,
                    'phone_number' => $number->phone_number,
                    'display_name' => $number->display_name,
                    'is_active' => $number->is_active,
                    'verified_at' => $number->verified_at,
                    'created_at' => $number->created_at,
                    'updated_at' => $number->updated_at,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $numbers
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch WhatsApp numbers', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch WhatsApp numbers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created WhatsApp number.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'phone_number_id' => 'required|string|max:255|unique:whatsapp_numbers,phone_number_id',
            'access_token' => 'required|string',
            'phone_number' => 'required|string|max:20',
            'display_name' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $whatsappNumber = WhatsAppNumber::create($request->all());

            Log::info('WhatsApp number created', ['whatsapp_number_id' => $whatsappNumber->id]);

            return response()->json([
                'success' => true,
                'message' => 'WhatsApp number created successfully',
                'data' => [
                    'id' => $whatsappNumber->id,
                    'phone_number_id' => $whatsappNumber->phone_number_id,
                    'phone_number' => $whatsappNumber->phone_number,
                    'display_name' => $whatsappNumber->display_name,
                    'is_active' => $whatsappNumber->is_active,
                ]
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to create WhatsApp number', [
                'error' => $e->getMessage(),
                'data' => $request->except(['access_token'])
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create WhatsApp number',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified WhatsApp number.
     */
    public function show($id): JsonResponse
    {
        try {
            $number = WhatsAppNumber::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $number->id,
                    'phone_number_id' => $number->phone_number_id,
                    'phone_number' => $number->phone_number,
                    'display_name' => $number->display_name,
                    'is_active' => $number->is_active,
                    'verified_at' => $number->verified_at,
                    'created_at' => $number->created_at,
                    'updated_at' => $number->updated_at,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'WhatsApp number not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified WhatsApp number.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'phone_number_id' => 'sometimes|string|max:255|unique:whatsapp_numbers,phone_number_id,' . $id,
            'access_token' => 'sometimes|string',
            'phone_number' => 'sometimes|string|max:20',
            'display_name' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $number = WhatsAppNumber::findOrFail($id);
            $number->update($request->all());

            Log::info('WhatsApp number updated', ['whatsapp_number_id' => $number->id]);

            return response()->json([
                'success' => true,
                'message' => 'WhatsApp number updated successfully',
                'data' => [
                    'id' => $number->id,
                    'phone_number_id' => $number->phone_number_id,
                    'phone_number' => $number->phone_number,
                    'display_name' => $number->display_name,
                    'is_active' => $number->is_active,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update WhatsApp number', [
                'whatsapp_number_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update WhatsApp number',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified WhatsApp number.
     */
    public function destroy($id): JsonResponse
    {
        try {
            $number = WhatsAppNumber::findOrFail($id);

            // Check if number is used in any campaigns
            if ($number->campaigns()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete WhatsApp number that is used in campaigns'
                ], 422);
            }

            $number->delete();

            Log::info('WhatsApp number deleted', ['whatsapp_number_id' => $id]);

            return response()->json([
                'success' => true,
                'message' => 'WhatsApp number deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete WhatsApp number', [
                'whatsapp_number_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete WhatsApp number',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test WhatsApp connection.
     */
    public function testConnection($id): JsonResponse
    {
        try {
            $number = WhatsAppNumber::findOrFail($id);
            
            $result = $this->whatsappService->testConnection($number);

            if ($result['success']) {
                // Update verified_at if connection successful
                $number->verified_at = now();
                $number->save();
            }

            return response()->json($result);
        } catch (\Exception $e) {
            Log::error('Failed to test WhatsApp connection', [
                'whatsapp_number_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to test connection',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get WhatsApp number status.
     */
    public function status($id): JsonResponse
    {
        try {
            $number = WhatsAppNumber::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $number->id,
                    'is_active' => $number->is_active,
                    'verified_at' => $number->verified_at,
                    'has_access_token' => !empty($number->access_token),
                    'phone_number' => $number->phone_number,
                    'display_name' => $number->display_name,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
