<?php

namespace App\Jobs;

use App\Models\MessageLog;
use App\Models\WebhookEvent;
use App\Services\CampaignService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Exception;

class ProcessWebhookEvent implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     *
     * @param int $webhookEventId
     */
    public function __construct(public int $webhookEventId)
    {
        //
    }

    /**
     * Execute the job.
     *
     * @param CampaignService $campaignService
     * @return void
     */
    public function handle(CampaignService $campaignService)
    {
        $webhookEvent = WebhookEvent::find($this->webhookEventId);

        if (!$webhookEvent) {
            Log::error('WebhookEvent not found', ['webhook_event_id' => $this->webhookEventId]);
            return;
        }

        if ($webhookEvent->processed) {
            Log::info('WebhookEvent already processed', ['webhook_event_id' => $this->webhookEventId]);
            return;
        }

        try {
            $payload = $webhookEvent->payload;
            $eventType = $webhookEvent->event_type;
            $waMessageId = $webhookEvent->wa_message_id;

            // Find message log by wa_message_id
            $messageLog = MessageLog::where('wa_message_id', $waMessageId)->first();

            if (!$messageLog) {
                Log::warning('MessageLog not found for webhook', [
                    'wa_message_id' => $waMessageId,
                    'event_type' => $eventType
                ]);
                $webhookEvent->processed = true;
                $webhookEvent->processed_at = now();
                $webhookEvent->save();
                return;
            }

            // Process based on event type
            switch ($eventType) {
                case 'message_sent':
                    $this->handleMessageSent($messageLog, $payload);
                    break;

                case 'message_delivered':
                    $this->handleMessageDelivered($messageLog, $payload);
                    break;

                case 'message_read':
                    $this->handleMessageRead($messageLog, $payload);
                    break;

                case 'message_failed':
                    $this->handleMessageFailed($messageLog, $payload);
                    break;

                default:
                    Log::warning('Unknown webhook event type', [
                        'event_type' => $eventType,
                        'webhook_event_id' => $this->webhookEventId
                    ]);
            }

            // Update campaign statistics
            if ($messageLog->campaign) {
                $messageLog->campaign->updateStatistics();
                $campaignService->checkCampaignCompletion($messageLog->campaign);
            }

            // Mark webhook as processed
            $webhookEvent->processed = true;
            $webhookEvent->processed_at = now();
            $webhookEvent->save();

            Log::info('Webhook event processed', [
                'webhook_event_id' => $this->webhookEventId,
                'event_type' => $eventType,
                'message_log_id' => $messageLog->id
            ]);

        } catch (Exception $e) {
            Log::error('Failed to process webhook event', [
                'webhook_event_id' => $this->webhookEventId,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Handle message_sent event
     */
    protected function handleMessageSent(MessageLog $messageLog, array $payload): void
    {
        if ($messageLog->status === 'PENDING') {
            $messageLog->status = 'SENT';
            $messageLog->sent_at = now();
            $messageLog->save();
        }
    }

    /**
     * Handle message_delivered event
     */
    protected function handleMessageDelivered(MessageLog $messageLog, array $payload): void
    {
        $messageLog->status = 'DELIVERED';
        $messageLog->delivered_at = now();
        $messageLog->save();
    }

    /**
     * Handle message_read event
     */
    protected function handleMessageRead(MessageLog $messageLog, array $payload): void
    {
        $messageLog->status = 'READ';
        $messageLog->read_at = now();
        // Also set delivered_at if not set
        if (!$messageLog->delivered_at) {
            $messageLog->delivered_at = now();
        }
        $messageLog->save();
    }

    /**
     * Handle message_failed event
     */
    protected function handleMessageFailed(MessageLog $messageLog, array $payload): void
    {
        $errorMessage = $payload['errors'][0]['message'] ?? 'Message failed';
        $errorCode = $payload['errors'][0]['code'] ?? 0;

        $messageLog->status = 'FAILED';
        $messageLog->error_message = "Error {$errorCode}: {$errorMessage}";
        $messageLog->failed_at = now();
        $messageLog->save();
    }
}
