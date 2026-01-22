<?php

return [
    /*
    |--------------------------------------------------------------------------
    | WhatsApp Cloud API Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Meta's WhatsApp Cloud API integration.
    |
    */

    'api_base_url' => env('WHATSAPP_API_BASE_URL', 'https://graph.facebook.com/v18.0'),

    'webhook_verify_token' => env('WHATSAPP_WEBHOOK_VERIFY_TOKEN'),

    'app_secret' => env('WHATSAPP_APP_SECRET'),

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting
    |--------------------------------------------------------------------------
    |
    | WhatsApp Cloud API rate limits:
    | - New numbers: 1,000 conversations per 24 hours
    | - Verified numbers: 1,000 conversations per 24 hours (can request increase)
    |
    */

    'rate_limit' => [
        'conversations_per_24h' => env('WHATSAPP_RATE_LIMIT_CONVERSATIONS', 1000),
        'messages_per_second' => env('WHATSAPP_RATE_LIMIT_MESSAGES_PER_SEC', 80),
    ],

    /*
    |--------------------------------------------------------------------------
    | Message Sending Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for message sending behavior.
    |
    */

    'sending' => [
        'chunk_size' => env('WHATSAPP_CHUNK_SIZE', 500), // Messages per batch
        'delay_between_batches' => env('WHATSAPP_DELAY_BETWEEN_BATCHES', 1), // Seconds
        'max_retries' => env('WHATSAPP_MAX_RETRIES', 3),
        'retry_delay' => env('WHATSAPP_RETRY_DELAY', 60), // Seconds
    ],

    /*
    |--------------------------------------------------------------------------
    | Webhook Configuration
    |--------------------------------------------------------------------------
    |
    | Webhook endpoint configuration.
    |
    */

    'webhook' => [
        'endpoint' => env('WHATSAPP_WEBHOOK_ENDPOINT', '/api/webhooks/whatsapp'),
        'verify_signature' => env('WHATSAPP_VERIFY_SIGNATURE', true),
    ],
];

