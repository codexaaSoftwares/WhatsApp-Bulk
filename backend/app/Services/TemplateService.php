<?php

namespace App\Services;

use App\Models\Template;
use Illuminate\Support\Facades\Log;
use Exception;

class TemplateService
{
    /**
     * Render template with variables
     *
     * @param Template $template
     * @param array $variables Key-value pairs of variable names and values
     * @return string
     */
    public function renderTemplate(Template $template, array $variables = []): string
    {
        $body = $template->body;

        // Replace variables in format {{variable_name}}
        foreach ($variables as $key => $value) {
            $body = str_replace('{{' . $key . '}}', (string)$value, $body);
        }

        return $body;
    }

    /**
     * Validate template structure
     *
     * @param array $data
     * @return array ['valid' => bool, 'errors' => []]
     */
    public function validateTemplate(array $data): array
    {
        $errors = [];

        // Required fields
        if (empty($data['name'])) {
            $errors[] = 'Template name is required';
        }

        if (empty($data['body'])) {
            $errors[] = 'Template body is required';
        }

        if (empty($data['category'])) {
            $errors[] = 'Template category is required';
        }

        // Validate category
        $validCategories = ['MARKETING', 'UTILITY', 'AUTHENTICATION'];
        if (!in_array($data['category'], $validCategories)) {
            $errors[] = 'Invalid template category';
        }

        // Validate header type if provided
        if (!empty($data['header_type'])) {
            $validHeaderTypes = ['TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT'];
            if (!in_array($data['header_type'], $validHeaderTypes)) {
                $errors[] = 'Invalid header type';
            }

            // Header content required if header type is set
            if (empty($data['header_content'])) {
                $errors[] = 'Header content is required when header type is set';
            }
        }

        // Extract and validate variables from body
        $variables = $this->extractVariables($data['body'] ?? '');
        if (!empty($data['variables']) && is_array($data['variables'])) {
            $providedVariables = $data['variables'];
            $missingVariables = array_diff($variables, $providedVariables);
            if (!empty($missingVariables)) {
                $errors[] = 'Missing variables in body: ' . implode(', ', $missingVariables);
            }
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }

    /**
     * Extract variable names from template body
     *
     * @param string $body
     * @return array
     */
    public function extractVariables(string $body): array
    {
        $variables = [];
        preg_match_all('/\{\{(\w+)\}\}/', $body, $matches);
        
        if (!empty($matches[1])) {
            $variables = array_unique($matches[1]);
        }

        return $variables;
    }

    /**
     * Approve template
     *
     * @param Template $template
     * @return bool
     */
    public function approveTemplate(Template $template): bool
    {
        try {
            $template->status = 'APPROVED';
            $template->save();

            Log::info('Template approved', [
                'template_id' => $template->id,
                'template_name' => $template->name
            ]);

            return true;
        } catch (Exception $e) {
            Log::error('Failed to approve template', [
                'template_id' => $template->id,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Reject template
     *
     * @param Template $template
     * @param string|null $reason
     * @return bool
     */
    public function rejectTemplate(Template $template, ?string $reason = null): bool
    {
        try {
            $template->status = 'REJECTED';
            $template->save();

            Log::info('Template rejected', [
                'template_id' => $template->id,
                'template_name' => $template->name,
                'reason' => $reason
            ]);

            return true;
        } catch (Exception $e) {
            Log::error('Failed to reject template', [
                'template_id' => $template->id,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Submit template for approval
     *
     * @param Template $template
     * @return bool
     */
    public function submitForApproval(Template $template): bool
    {
        try {
            $template->status = 'PENDING';
            $template->save();

            Log::info('Template submitted for approval', [
                'template_id' => $template->id,
                'template_name' => $template->name
            ]);

            return true;
        } catch (Exception $e) {
            Log::error('Failed to submit template for approval', [
                'template_id' => $template->id,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Build WhatsApp API components from template and variables
     *
     * @param Template $template
     * @param array $variables
     * @return array
     */
    public function buildWhatsAppComponents(Template $template, array $variables = []): array
    {
        $components = [];

        // Body components
        $bodyVariables = $template->variables ?? [];
        if (!empty($bodyVariables)) {
            $bodyParams = [];
            foreach ($bodyVariables as $varName) {
                $value = $variables[$varName] ?? '';
                $bodyParams[] = ['type' => 'text', 'text' => (string)$value];
            }
            if (!empty($bodyParams)) {
                $components[] = [
                    'type' => 'body',
                    'parameters' => $bodyParams
                ];
            }
        }

        // Header components (if template has header)
        if ($template->header_type && $template->header_content) {
            if ($template->header_type === 'IMAGE' || $template->header_type === 'VIDEO') {
                // For media headers, use the URL directly or from variables
                $headerUrl = $variables['header_url'] ?? $template->header_content;
                $components[] = [
                    'type' => 'header',
                    'parameters' => [
                        [
                            'type' => strtolower($template->header_type),
                            strtolower($template->header_type) => [
                                'link' => $headerUrl
                            ]
                        ]
                    ]
                ];
            } elseif ($template->header_type === 'TEXT') {
                $headerText = $variables['header_text'] ?? $template->header_content;
                $components[] = [
                    'type' => 'header',
                    'parameters' => [
                        ['type' => 'text', 'text' => (string)$headerText]
                    ]
                ];
            }
        }

        // Button components (if template has buttons)
        if ($template->buttons && is_array($template->buttons)) {
            foreach ($template->buttons as $index => $button) {
                if ($button['type'] === 'URL' && isset($variables['button_' . $index . '_url'])) {
                    $components[] = [
                        'type' => 'button',
                        'sub_type' => 'url',
                        'index' => (string)$index,
                        'parameters' => [
                            ['type' => 'text', 'text' => $variables['button_' . $index . '_url']]
                        ]
                    ];
                }
            }
        }

        return $components;
    }
}

