<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Services\CampaignService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class CampaignController extends Controller
{
    protected $campaignService;

    public function __construct(CampaignService $campaignService)
    {
        $this->campaignService = $campaignService;
    }

    /**
     * Display a listing of campaigns.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Campaign::with(['whatsappNumber', 'template']);

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Search by name
            if ($request->has('search')) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }

            // Sort
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginate
            $perPage = $request->get('per_page', 15);
            $campaigns = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $campaigns
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch campaigns', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch campaigns',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created campaign.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'whatsapp_number_id' => 'required|exists:whatsapp_numbers,id',
            'template_id' => 'required|exists:templates,id',
            'contact_ids' => 'required|array|min:1',
            'contact_ids.*' => 'exists:contacts,id',
            'variable_values' => 'nullable|array',
            'variable_values.*' => 'array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $campaign = $this->campaignService->createCampaign($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Campaign created successfully',
                'data' => $campaign->load(['whatsappNumber', 'template'])
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to create campaign', [
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create campaign',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified campaign.
     */
    public function show($id): JsonResponse
    {
        try {
            $campaign = Campaign::with([
                'whatsappNumber',
                'template',
                'messageLogs' => function ($query) {
                    $query->with('contact')->latest()->limit(100);
                }
            ])->findOrFail($id);

            // Calculate statistics
            $campaign->updateStatistics();

            return response()->json([
                'success' => true,
                'data' => $campaign
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch campaign', [
                'campaign_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Campaign not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Get campaign statistics.
     */
    public function stats($id): JsonResponse
    {
        try {
            $campaign = Campaign::findOrFail($id);
            $campaign->updateStatistics();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_messages' => $campaign->total_messages,
                    'sent_count' => $campaign->sent_count,
                    'delivered_count' => $campaign->delivered_count,
                    'read_count' => $campaign->read_count,
                    'failed_count' => $campaign->failed_count,
                    'delivery_percentage' => $campaign->delivery_percentage,
                    'failure_percentage' => $campaign->failure_percentage,
                    'status' => $campaign->status,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch campaign statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Start a campaign.
     */
    public function start($id): JsonResponse
    {
        try {
            $campaign = Campaign::findOrFail($id);
            
            $this->campaignService->startCampaign($campaign);

            return response()->json([
                'success' => true,
                'message' => 'Campaign started successfully',
                'data' => $campaign->fresh()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to start campaign', [
                'campaign_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to start campaign',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Retry failed messages in a campaign.
     */
    public function retryFailed($id): JsonResponse
    {
        try {
            $campaign = Campaign::findOrFail($id);
            
            $count = $this->campaignService->retryFailedMessages($campaign);

            return response()->json([
                'success' => true,
                'message' => "{$count} failed messages queued for retry",
                'data' => [
                    'retry_count' => $count
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to retry failed messages', [
                'campaign_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retry failed messages',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
