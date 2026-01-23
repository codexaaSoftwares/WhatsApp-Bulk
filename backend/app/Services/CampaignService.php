<?php

namespace App\Services;

use App\Models\Campaign;
use App\Models\Contact;
use App\Models\Template;
use App\Models\WhatsAppNumber;
use App\Models\MessageLog;
use App\Jobs\SendWhatsAppMessage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class CampaignService
{
    protected $whatsappService;
    protected $templateService;

    public function __construct(WhatsAppService $whatsappService, TemplateService $templateService)
    {
        $this->whatsappService = $whatsappService;
        $this->templateService = $templateService;
    }

    /**
     * Create a new campaign with message logs
     *
     * @param array $data
     * @return Campaign
     * @throws Exception
     */
    public function createCampaign(array $data): Campaign
    {
        DB::beginTransaction();

        try {
            // Validate required data
            $whatsappNumber = WhatsAppNumber::findOrFail($data['whatsapp_number_id']);
            $template = Template::findOrFail($data['template_id']);

            // Check if template is approved
            if ($template->status !== 'APPROVED') {
                throw new Exception('Template must be approved before creating a campaign');
            }

            // Check if WhatsApp number is active
            if (!$whatsappNumber->is_active) {
                throw new Exception('WhatsApp number must be active');
            }

            // Create campaign
            $campaign = Campaign::create([
                'name' => $data['name'] ?? $this->generateCampaignName($template),
                'whatsapp_number_id' => $data['whatsapp_number_id'],
                'template_id' => $data['template_id'],
                'status' => 'PENDING',
                'total_messages' => 0,
                'sent_count' => 0,
                'delivered_count' => 0,
                'read_count' => 0,
                'failed_count' => 0,
            ]);

            // Create message logs for each contact
            $contacts = Contact::whereIn('id', $data['contact_ids'])->where('is_active', true)->get();
            
            if ($contacts->isEmpty()) {
                throw new Exception('No active contacts selected');
            }

            $messageLogs = [];
            foreach ($contacts as $contact) {
                // Prepare variables for this contact
                $variables = $data['variable_values'][$contact->id] ?? [];

                // Render message content (for our records)
                $messageContent = $this->templateService->renderTemplate($template, $variables);

                // Create message log
                $messageLogs[] = [
                    'campaign_id' => $campaign->id,
                    'contact_id' => $contact->id,
                    'whatsapp_number_id' => $whatsappNumber->id,
                    'template_id' => $template->id,
                    'mobile_number' => $contact->mobile_number,
                    'message_content' => $messageContent,
                    'variable_values' => $variables, // Store variables for WhatsApp API
                    'status' => 'PENDING',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            // Bulk insert message logs
            MessageLog::insert($messageLogs);

            // Update campaign total_messages
            $campaign->total_messages = count($messageLogs);
            $campaign->save();

            DB::commit();

            Log::info('Campaign created', [
                'campaign_id' => $campaign->id,
                'total_messages' => $campaign->total_messages
            ]);

            return $campaign;
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to create campaign', [
                'error' => $e->getMessage(),
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Start a campaign (dispatch jobs to send messages)
     *
     * @param Campaign $campaign
     * @return bool
     * @throws Exception
     */
    public function startCampaign(Campaign $campaign): bool
    {
        try {
            // Check if campaign can be started
            if ($campaign->status !== 'PENDING') {
                throw new Exception('Campaign can only be started if status is PENDING');
            }

            // Update campaign status
            $campaign->status = 'PROCESSING';
            $campaign->started_at = now();
            $campaign->save();

            // Get pending message logs
            $messageLogs = MessageLog::where('campaign_id', $campaign->id)
                ->where('status', 'PENDING')
                ->get();

            if ($messageLogs->isEmpty()) {
                $campaign->status = 'COMPLETED';
                $campaign->completed_at = now();
                $campaign->save();
                return true;
            }

            // Dispatch jobs for each message
            $chunkSize = config('whatsapp.sending.chunk_size', 500);
            $delayBetweenBatches = config('whatsapp.sending.delay_between_batches', 1);

            $batchNumber = 0;
            foreach ($messageLogs->chunk($chunkSize) as $chunk) {
                foreach ($chunk as $messageLog) {
                    // Add delay based on batch number
                    $delay = $batchNumber * $delayBetweenBatches;
                    
                    SendWhatsAppMessage::dispatch($messageLog->id)
                        ->delay(now()->addSeconds($delay));
                }
                $batchNumber++;
            }

            Log::info('Campaign started', [
                'campaign_id' => $campaign->id,
                'total_messages' => $messageLogs->count()
            ]);

            return true;
        } catch (Exception $e) {
            Log::error('Failed to start campaign', [
                'campaign_id' => $campaign->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Generate campaign name if not provided
     *
     * @param Template $template
     * @return string
     */
    protected function generateCampaignName(Template $template): string
    {
        return $template->name . ' - ' . now()->format('Y-m-d H:i:s');
    }

    /**
     * Retry failed messages in a campaign
     *
     * @param Campaign $campaign
     * @return int Number of messages queued for retry
     */
    public function retryFailedMessages(Campaign $campaign): int
    {
        $failedLogs = MessageLog::where('campaign_id', $campaign->id)
            ->where('status', 'FAILED')
            ->get();

        $count = 0;
        foreach ($failedLogs as $messageLog) {
            // Reset status to PENDING
            $messageLog->status = 'PENDING';
            $messageLog->error_message = null;
            $messageLog->retry_count = ($messageLog->retry_count ?? 0) + 1;
            $messageLog->save();

            // Dispatch job
            SendWhatsAppMessage::dispatch($messageLog->id);
            $count++;
        }

        Log::info('Retrying failed messages', [
            'campaign_id' => $campaign->id,
            'count' => $count
        ]);

        return $count;
    }

    /**
     * Check and update campaign completion status
     *
     * @param Campaign $campaign
     * @return void
     */
    public function checkCampaignCompletion(Campaign $campaign): void
    {
        $pendingCount = MessageLog::where('campaign_id', $campaign->id)
            ->where('status', 'PENDING')
            ->count();

        if ($pendingCount === 0 && $campaign->status === 'PROCESSING') {
            $campaign->status = 'COMPLETED';
            $campaign->completed_at = now();
            $campaign->updateStatistics();
            $campaign->save();

            Log::info('Campaign completed', [
                'campaign_id' => $campaign->id
            ]);
        }
    }
}

