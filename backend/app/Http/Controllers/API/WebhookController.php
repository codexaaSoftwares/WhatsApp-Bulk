<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\WebhookEvent;
use App\Services\WhatsAppService;
use App\Jobs\ProcessWebhookEvent;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    protected $whatsappService;

    public function __construct(WhatsAppService $whatsappService)
    {
        $this->whatsappService = $whatsappService;
    }

    /**
     * Handle webhook verification (GET request from Meta)
     */
    public function verify(Request $request): JsonResponse|string
    {
        $mode = $request->query('hub_mode');
        $token = $request->query('hub_verify_token');
        $challenge = $request->query('hub_challenge');

        $result = $this->whatsappService->verifyWebhook($mode, $token, $challenge);

        if ($result !== false) {
            return response($result, 200)->header('Content-Type', 'text/plain');
        }

        return response()->json([
            'success' => false,
            'message' => 'Verification failed'
        ], 403);
    }

    /**
     * Handle webhook events (POST request from Meta)
     */
    public function handle(Request $request): JsonResponse
    {
        try {
            // Verify webhook signature if configured
            $signature = $request->header('X-Hub-Signature-256');
            if ($signature && config('whatsapp.webhook.verify_signature', true)) {
                $payload = $request->getContent();
                $signature = str_replace('sha256=', '', $signature);
                
                if (!$this->whatsappService->verifyWebhookSignature($payload, $signature)) {
                    Log::warning('Webhook signature verification failed', [
                        'signature' => $signature
                    ]);
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid signature'
                    ], 403);
                }
            }

            $payload = $request->json()->all();

            // Log webhook event
            Log::info('Webhook received', ['payload' => $payload]);

            // Process webhook entries
            if (isset($payload['entry'])) {
                foreach ($payload['entry'] as $entry) {
                    if (isset($entry['changes'])) {
                        foreach ($entry['changes'] as $change) {
                            if (isset($change['value']['statuses'])) {
                                // Process message status updates
                                foreach ($change['value']['statuses'] as $status) {
                                    $this->processStatusUpdate($status);
                                }
                            }

                            if (isset($change['value']['messages'])) {
                                // Process incoming messages (if needed)
                                foreach ($change['value']['messages'] as $message) {
                                    // Handle incoming messages if needed
                                }
                            }
                        }
                    }
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Webhook processed'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Webhook processing failed', [
                'error' => $e->getMessage(),
                'payload' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Webhook processing failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Process status update from webhook
     */
    protected function processStatusUpdate(array $status): void
    {
        try {
            $waMessageId = $status['id'] ?? null;
            $statusType = $status['status'] ?? null;
            $recipientId = $status['recipient_id'] ?? null;

            if (!$waMessageId || !$statusType) {
                Log::warning('Invalid status update', ['status' => $status]);
                return;
            }

            // Map WhatsApp status to our status
            $eventType = $this->mapStatusToEventType($statusType);

            // Create webhook event record
            $webhookEvent = WebhookEvent::create([
                'event_type' => $eventType,
                'wa_message_id' => $waMessageId,
                'payload' => $status,
                'processed' => false,
            ]);

            // Dispatch job to process webhook event
            ProcessWebhookEvent::dispatch($webhookEvent->id);

            Log::info('Webhook event queued', [
                'webhook_event_id' => $webhookEvent->id,
                'event_type' => $eventType,
                'wa_message_id' => $waMessageId
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to process status update', [
                'error' => $e->getMessage(),
                'status' => $status
            ]);
        }
    }

    /**
     * Map WhatsApp status to event type
     */
    protected function mapStatusToEventType(string $status): string
    {
        return match($status) {
            'sent' => 'message_sent',
            'delivered' => 'message_delivered',
            'read' => 'message_read',
            'failed' => 'message_failed',
            default => 'message_' . strtolower($status),
        };
    }
}
