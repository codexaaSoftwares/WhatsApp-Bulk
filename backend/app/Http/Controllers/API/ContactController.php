<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class ContactController extends Controller
{
    protected $whatsappService;

    public function __construct(WhatsAppService $whatsappService)
    {
        $this->whatsappService = $whatsappService;
    }

    /**
     * Display a listing of contacts.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Contact::query();

            // Filter by active status
            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            // Search
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', '%' . $search . '%')
                      ->orWhere('mobile_number', 'like', '%' . $search . '%')
                      ->orWhere('email', 'like', '%' . $search . '%');
                });
            }

            // Sort
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginate
            $perPage = $request->get('per_page', 15);
            $contacts = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $contacts
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch contacts', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch contacts',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created contact.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'mobile_number' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'notes' => 'nullable|string',
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
            // Format phone number to E.164 format
            $mobileNumber = $this->whatsappService->formatPhoneNumber($request->mobile_number);

            // Validate phone number
            if (!$this->whatsappService->validatePhoneNumber($mobileNumber)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid phone number format. Must be in E.164 format (e.g., +1234567890)',
                    'errors' => ['mobile_number' => ['Invalid phone number format']]
                ], 422);
            }

            $contact = Contact::create([
                'name' => $request->name,
                'mobile_number' => $mobileNumber,
                'email' => $request->email,
                'notes' => $request->notes,
                'is_active' => $request->get('is_active', true),
            ]);

            Log::info('Contact created', ['contact_id' => $contact->id]);

            return response()->json([
                'success' => true,
                'message' => 'Contact created successfully',
                'data' => $contact
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to create contact', [
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create contact',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified contact.
     */
    public function show($id): JsonResponse
    {
        try {
            $contact = Contact::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $contact
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Contact not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified contact.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'mobile_number' => 'sometimes|string|max:20',
            'email' => 'nullable|email|max:255',
            'notes' => 'nullable|string',
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
            $contact = Contact::findOrFail($id);
            $data = $request->all();

            // Format phone number if provided
            if ($request->has('mobile_number')) {
                $mobileNumber = $this->whatsappService->formatPhoneNumber($request->mobile_number);
                
                if (!$this->whatsappService->validatePhoneNumber($mobileNumber)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid phone number format. Must be in E.164 format (e.g., +1234567890)',
                        'errors' => ['mobile_number' => ['Invalid phone number format']]
                    ], 422);
                }
                
                $data['mobile_number'] = $mobileNumber;
            }

            $contact->update($data);

            Log::info('Contact updated', ['contact_id' => $contact->id]);

            return response()->json([
                'success' => true,
                'message' => 'Contact updated successfully',
                'data' => $contact->fresh()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update contact', [
                'contact_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update contact',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified contact.
     */
    public function destroy($id): JsonResponse
    {
        try {
            $contact = Contact::findOrFail($id);

            // Check if contact is used in any message logs
            if ($contact->messageLogs()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete contact that has message logs'
                ], 422);
            }

            $contact->delete();

            Log::info('Contact deleted', ['contact_id' => $id]);

            return response()->json([
                'success' => true,
                'message' => 'Contact deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete contact', [
                'contact_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete contact',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
