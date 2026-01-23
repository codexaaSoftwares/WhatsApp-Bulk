<?php

namespace App\Services;

use App\Models\WhatsAppNumber;
use App\Models\MessageLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class WhatsAppService
{
    protected $apiBaseUrl;
    protected $appSecret;

    public function __construct()
    {
        $this->apiBaseUrl = config('whatsapp.api_base_url');
        $this->appSecret = config('whatsapp.app_secret');
    }

    /**
     * Send a template message via WhatsApp Cloud API
     *
     * @param WhatsAppNumber $whatsappNumber
     * @param string $to Phone number in E.164 format (e.g., +1234567890)
     * @param string $templateName Template name
     * @param array $templateParams Template parameters
     * @param array $components Optional components (header, body, buttons)
     * @return array
     * @throws Exception
     */
    public function sendTemplateMessage(
        WhatsAppNumber $whatsappNumber,
        string $to,
        string $templateName,
        array $templateParams = [],
        array $components = []
    ): array {
        try {
            $phoneNumberId = $whatsappNumber->phone_number_id;
            $accessToken = $whatsappNumber->access_token;

            if (!$phoneNumberId || !$accessToken) {
                throw new Exception('WhatsApp number not properly configured');
            }

            // Validate phone number format
            if (!$this->validatePhoneNumber($to)) {
                throw new Exception('Invalid phone number format. Must be in E.164 format (e.g., +1234567890)');
            }

            // Build the request payload
            $payload = [
                'messaging_product' => 'whatsapp',
                'to' => $to,
                'type' => 'template',
                'template' => [
                    'name' => $templateName,
                    'language' => [
                        'code' => 'en'
                    ]
                ]
            ];

            // Add components if provided (for template variables)
            if (!empty($components)) {
                $payload['template']['components'] = $components;
            } elseif (!empty($templateParams)) {
                // Auto-generate components from templateParams
                $components = $this->buildComponentsFromParams($templateParams);
                if (!empty($components)) {
                    $payload['template']['components'] = $components;
                }
            }

            // Make API request
            $url = "{$this->apiBaseUrl}/{$phoneNumberId}/messages";
            
            $response = Http::withToken($accessToken)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                ])
                ->post($url, $payload);

            $responseData = $response->json();

            if ($response->successful() && isset($responseData['messages'][0]['id'])) {
                return [
                    'success' => true,
                    'wa_message_id' => $responseData['messages'][0]['id'],
                    'response' => $responseData
                ];
            } else {
                $errorMessage = $responseData['error']['message'] ?? 'Unknown error';
                $errorCode = $responseData['error']['code'] ?? 0;
                
                Log::error('WhatsApp API Error', [
                    'error' => $responseData['error'] ?? [],
                    'payload' => $payload,
                    'phone_number_id' => $phoneNumberId
                ]);

                throw new Exception("WhatsApp API Error: {$errorMessage} (Code: {$errorCode})");
            }
        } catch (Exception $e) {
            Log::error('WhatsApp Send Message Failed', [
                'error' => $e->getMessage(),
                'to' => $to,
                'template' => $templateName
            ]);

            throw $e;
        }
    }

    /**
     * Build components array from template parameters
     *
     * @param array $params
     * @return array
     */
    protected function buildComponentsFromParams(array $params): array
    {
        $components = [];

        // Body parameters
        if (isset($params['body']) && !empty($params['body'])) {
            $bodyParams = [];
            foreach ($params['body'] as $param) {
                $bodyParams[] = ['type' => 'text', 'text' => (string)$param];
            }
            if (!empty($bodyParams)) {
                $components[] = [
                    'type' => 'body',
                    'parameters' => $bodyParams
                ];
            }
        }

        // Header parameters
        if (isset($params['header']) && !empty($params['header'])) {
            $headerParams = [];
            foreach ($params['header'] as $param) {
                if (filter_var($param, FILTER_VALIDATE_URL)) {
                    // URL parameter
                    $headerParams[] = ['type' => 'image', 'image' => ['link' => $param]];
                } else {
                    // Text parameter
                    $headerParams[] = ['type' => 'text', 'text' => (string)$param];
                }
            }
            if (!empty($headerParams)) {
                $components[] = [
                    'type' => 'header',
                    'parameters' => $headerParams
                ];
            }
        }

        // Button parameters
        if (isset($params['buttons']) && !empty($params['buttons'])) {
            $buttonParams = [];
            foreach ($params['buttons'] as $index => $button) {
                if (isset($button['type']) && $button['type'] === 'URL') {
                    $buttonParams[] = [
                        'type' => 'button',
                        'sub_type' => 'url',
                        'index' => (string)$index,
                        'parameters' => [
                            ['type' => 'text', 'text' => $button['url'] ?? '']
                        ]
                    ];
                }
            }
            if (!empty($buttonParams)) {
                $components[] = [
                    'type' => 'button',
                    'sub_type' => 'button',
                    'index' => '0',
                    'parameters' => $buttonParams
                ];
            }
        }

        return $components;
    }

    /**
     * Verify webhook signature from Meta
     *
     * @param string $payload
     * @param string $signature
     * @return bool
     */
    public function verifyWebhookSignature(string $payload, string $signature): bool
    {
        if (empty($this->appSecret)) {
            Log::warning('WhatsApp App Secret not configured, skipping signature verification');
            return true; // Allow if not configured (development)
        }

        try {
            $expectedSignature = hash_hmac('sha256', $payload, $this->appSecret);
            return hash_equals($expectedSignature, $signature);
        } catch (Exception $e) {
            Log::error('Webhook signature verification failed', [
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Verify webhook during Meta's verification request
     *
     * @param string $mode
     * @param string $token
     * @param string $challenge
     * @return string|false
     */
    public function verifyWebhook(string $mode, string $token, string $challenge)
    {
        $verifyToken = config('whatsapp.webhook_verify_token');

        if ($mode === 'subscribe' && $token === $verifyToken) {
            return $challenge;
        }

        return false;
    }

    /**
     * Validate phone number format (E.164)
     *
     * @param string $phoneNumber
     * @return bool
     */
    public function validatePhoneNumber(string $phoneNumber): bool
    {
        // E.164 format: +[country code][number] (max 15 digits)
        return preg_match('/^\+[1-9]\d{1,14}$/', $phoneNumber) === 1;
    }

    /**
     * Format phone number to E.164 format
     *
     * @param string $phoneNumber
     * @return string
     */
    public function formatPhoneNumber(string $phoneNumber): string
    {
        // Remove all non-digit characters except +
        $cleaned = preg_replace('/[^\d+]/', '', $phoneNumber);

        // If doesn't start with +, add it
        if (!str_starts_with($cleaned, '+')) {
            $cleaned = '+' . $cleaned;
        }

        return $cleaned;
    }

    /**
     * Test connection to WhatsApp API
     *
     * @param WhatsAppNumber $whatsappNumber
     * @return array
     */
    public function testConnection(WhatsAppNumber $whatsappNumber): array
    {
        try {
            $phoneNumberId = $whatsappNumber->phone_number_id;
            $accessToken = $whatsappNumber->access_token;

            if (!$phoneNumberId || !$accessToken) {
                return [
                    'success' => false,
                    'message' => 'WhatsApp number not properly configured'
                ];
            }

            // Try to get phone number info
            $url = "{$this->apiBaseUrl}/{$phoneNumberId}?fields=verified_name,display_phone_number";
            
            $response = Http::withToken($accessToken)
                ->get($url);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'Connection successful',
                    'data' => $response->json()
                ];
            } else {
                $errorData = $response->json();
                return [
                    'success' => false,
                    'message' => $errorData['error']['message'] ?? 'Connection failed',
                    'error' => $errorData['error'] ?? []
                ];
            }
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
}

