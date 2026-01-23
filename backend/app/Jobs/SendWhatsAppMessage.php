<?php

namespace App\Jobs;

use App\Models\MessageLog;
use App\Services\WhatsAppService;
use App\Services\TemplateService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Exception;

class SendWhatsAppMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [60, 300, 900]; // Retry after 1min, 5min, 15min

    /**
     * Create a new job instance.
     *
     * @param int $messageLogId
     */
    public function __construct(public int $messageLogId)
    {
        //
    }

    /**
     * Execute the job.
     *
     * @param WhatsAppService $whatsappService
     * @param TemplateService $templateService
     * @return void
     */
    public function handle(WhatsAppService $whatsappService, TemplateService $templateService)
    {
        $messageLog = MessageLog::with(['whatsappNumber', 'template', 'contact'])->find($this->messageLogId);

        if (!$messageLog) {
            Log::error('MessageLog not found', ['message_log_id' => $this->messageLogId]);
            return;
        }

        // Check if already sent
        if ($messageLog->status !== 'PENDING') {
            Log::info('Message already processed', [
                'message_log_id' => $this->messageLogId,
                'status' => $messageLog->status
            ]);
            return;
        }

        try {
            $whatsappNumber = $messageLog->whatsappNumber;
            $template = $messageLog->template;
            $contact = $messageLog->contact;

            if (!$whatsappNumber || !$template || !$contact) {
                throw new Exception('Missing required relationships');
            }

            // Check if template is approved
            if ($template->status !== 'APPROVED') {
                throw new Exception('Template is not approved');
            }

            // Use the template name from Meta or our template name
            $templateName = $template->meta_template_id ?? $template->name;

            // Get variable values from message log
            $variables = $messageLog->variable_values ?? [];

            // Build components for WhatsApp API
            $components = $templateService->buildWhatsAppComponents($template, $variables);

            // Send message via WhatsApp API
            $result = $whatsappService->sendTemplateMessage(
                $whatsappNumber,
                $contact->mobile_number,
                $templateName,
                [],
                $components
            );

            // Update message log
            $messageLog->wa_message_id = $result['wa_message_id'];
            $messageLog->status = 'SENT';
            $messageLog->sent_at = now();
            $messageLog->save();

            // Update campaign statistics
            if ($messageLog->campaign) {
                $messageLog->campaign->updateStatistics();
            }

            Log::info('Message sent successfully', [
                'message_log_id' => $this->messageLogId,
                'wa_message_id' => $result['wa_message_id']
            ]);

        } catch (Exception $e) {
            // Update message log with error
            $messageLog->status = 'FAILED';
            $messageLog->error_message = $e->getMessage();
            $messageLog->failed_at = now();
            $messageLog->retry_count = ($messageLog->retry_count ?? 0) + 1;
            $messageLog->save();

            // Update campaign statistics
            if ($messageLog->campaign) {
                $messageLog->campaign->updateStatistics();
            }

            Log::error('Failed to send message', [
                'message_log_id' => $this->messageLogId,
                'error' => $e->getMessage(),
                'attempt' => $this->attempts()
            ]);

            // Re-throw to trigger retry if attempts remaining
            if ($this->attempts() < $this->tries) {
                throw $e;
            }
        }
    }

    /**
     * Extract variables from rendered message content
     * This is a helper to reverse-engineer variables if needed
     *
     * @param string $content
     * @param \App\Models\Template $template
     * @return array
     */
    protected function extractVariablesFromContent(string $content, $template): array
    {
        // For now, return empty array
        // In future, we might store variables separately
        return [];
    }

    /**
     * Handle a job failure.
     *
     * @param Exception $exception
     * @return void
     */
    public function failed(Exception $exception)
    {
        $messageLog = MessageLog::find($this->messageLogId);
        
        if ($messageLog) {
            $messageLog->status = 'FAILED';
            $messageLog->error_message = $exception->getMessage();
            $messageLog->failed_at = now();
            $messageLog->save();

            if ($messageLog->campaign) {
                $messageLog->campaign->updateStatistics();
            }
        }

        Log::error('SendWhatsAppMessage job failed permanently', [
            'message_log_id' => $this->messageLogId,
            'error' => $exception->getMessage()
        ]);
    }
}
