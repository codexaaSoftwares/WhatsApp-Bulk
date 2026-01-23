<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Template;
use App\Services\TemplateService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class TemplateController extends Controller
{
    protected $templateService;

    public function __construct(TemplateService $templateService)
    {
        $this->templateService = $templateService;
    }

    /**
     * Display a listing of templates.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Template::query();

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Filter by category
            if ($request->has('category')) {
                $query->where('category', $request->category);
            }

            // Only approved templates
            if ($request->boolean('approved_only')) {
                $query->approved();
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
            $templates = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $templates
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch templates', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch templates',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created template.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:templates,name',
            'language' => 'required|string|max:10',
            'category' => 'required|in:MARKETING,UTILITY,AUTHENTICATION',
            'body' => 'required|string',
            'header_type' => 'nullable|in:TEXT,IMAGE,VIDEO,DOCUMENT',
            'header_content' => 'nullable|string',
            'footer' => 'nullable|string',
            'buttons' => 'nullable|array',
            'variables' => 'nullable|array',
            'status' => 'nullable|in:DRAFT,PENDING,APPROVED,REJECTED',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Extract variables from body if not provided
            $data = $request->all();
            if (empty($data['variables'])) {
                $data['variables'] = $this->templateService->extractVariables($data['body']);
            }

            // Validate template structure
            $validation = $this->templateService->validateTemplate($data);
            if (!$validation['valid']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Template validation failed',
                    'errors' => $validation['errors']
                ], 422);
            }

            $template = Template::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Template created successfully',
                'data' => $template
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to create template', [
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create template',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified template.
     */
    public function show($id): JsonResponse
    {
        try {
            $template = Template::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $template
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Template not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified template.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255|unique:templates,name,' . $id,
            'language' => 'sometimes|string|max:10',
            'category' => 'sometimes|in:MARKETING,UTILITY,AUTHENTICATION',
            'body' => 'sometimes|string',
            'header_type' => 'nullable|in:TEXT,IMAGE,VIDEO,DOCUMENT',
            'header_content' => 'nullable|string',
            'footer' => 'nullable|string',
            'buttons' => 'nullable|array',
            'variables' => 'nullable|array',
            'status' => 'sometimes|in:DRAFT,PENDING,APPROVED,REJECTED',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $template = Template::findOrFail($id);
            $data = $request->all();

            // Extract variables from body if body is updated
            if (isset($data['body']) && empty($data['variables'])) {
                $data['variables'] = $this->templateService->extractVariables($data['body']);
            }

            $template->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Template updated successfully',
                'data' => $template->fresh()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update template', [
                'template_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update template',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified template.
     */
    public function destroy($id): JsonResponse
    {
        try {
            $template = Template::findOrFail($id);

            // Check if template is used in any campaigns
            if ($template->campaigns()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete template that is used in campaigns'
                ], 422);
            }

            $template->delete();

            return response()->json([
                'success' => true,
                'message' => 'Template deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete template', [
                'template_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete template',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Preview template with sample variables.
     */
    public function preview(Request $request, $id): JsonResponse
    {
        try {
            $template = Template::findOrFail($id);
            $variables = $request->get('variables', []);

            $rendered = $this->templateService->renderTemplate($template, $variables);

            return response()->json([
                'success' => true,
                'data' => [
                    'template' => $template,
                    'rendered_content' => $rendered,
                    'variables_used' => $variables
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to preview template',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approve template.
     */
    public function approve($id): JsonResponse
    {
        try {
            $template = Template::findOrFail($id);
            
            $this->templateService->approveTemplate($template);

            return response()->json([
                'success' => true,
                'message' => 'Template approved successfully',
                'data' => $template->fresh()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to approve template', [
                'template_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to approve template',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject template.
     */
    public function reject(Request $request, $id): JsonResponse
    {
        try {
            $template = Template::findOrFail($id);
            $reason = $request->get('reason');
            
            $this->templateService->rejectTemplate($template, $reason);

            return response()->json([
                'success' => true,
                'message' => 'Template rejected successfully',
                'data' => $template->fresh()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to reject template', [
                'template_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to reject template',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Submit template for approval.
     */
    public function submitForApproval($id): JsonResponse
    {
        try {
            $template = Template::findOrFail($id);
            
            $this->templateService->submitForApproval($template);

            return response()->json([
                'success' => true,
                'message' => 'Template submitted for approval',
                'data' => $template->fresh()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to submit template for approval', [
                'template_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to submit template for approval',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
