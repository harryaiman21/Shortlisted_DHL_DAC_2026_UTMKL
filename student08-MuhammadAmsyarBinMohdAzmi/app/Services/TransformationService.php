<?php

namespace App\Services;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TransformationService
{
    /**
     * The main entry point for transforming raw messy input.
     */
    public function transform(string $text): array
    {
        // Prioritize Gemini as it is your active free-tier AI
        if (config('services.gemini.key')) {
            return $this->transformWithAI($text);
        }

        // Fallback to rules if no API key is found
        return $this->transformWithRules($text);
    }

    /**
     * AI MODE: Uses Google Gemini 1.5 Flash
     */
protected function transformWithAI(string $text): array
{
    try {
        $apiKey = config('services.gemini.key');
        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}";

        $response = Http::withHeaders(['Content-Type' => 'application/json'])
            ->post($url, [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => "You are a Senior Logistics Technical Writer at DHL. 
                             Transform the input into a professional SOP.
                             Return ONLY a JSON object with this exact structure:
                             
                             {
                               \"title\": \"Professional title\",
                               \"summary\": \"Executive summary\",
                               \"sections\": [
                                 { \"heading\": \"Purpose\", \"content\": \"Summary of objective\" },
                                 { \"heading\": \"Procedure\", \"content\": \"Numbered list of steps\" },
                                 { \"heading\": \"Notes\", \"content\": \"Hazards and equipment info\" }
                               ]
                             }
                             
                             Input: " . $text]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'response_mime_type' => 'application/json',
                ]
            ]);

        if ($response->successful()) {
            $data = $response->json();
            $aiResult = json_decode($data['candidates'][0]['content']['parts'][0]['text'], true);

            // We now return 'sections' directly to match your Livewire logic
            return [
                'title'      => $aiResult['title'] ?? 'Logistics Incident',
                'summary'    => $aiResult['summary'] ?? '',
                'sections'   => $aiResult['sections'] ?? [], // THE CRITICAL KEY
                'method'     => 'gemini_ai',
                'confidence' => 0.95
            ];
        }
    } catch (\Exception $e) {
        \Log::error("Gemini Error: " . $e->getMessage());
    }
    return $this->transformWithRules($text);
}

protected function transformWithRules(string $text): array
    {
        $cleanText = preg_replace('/(\d{1,2}:\d{2}(:\d{2})?\s?(AM|PM)?)|(\[\d{2}:\d{2}\])|(\d{1,2}\/\d{1,2}\/\d{2,4})/', '', $text);
        
        $lines = collect(explode("\n", $cleanText))
            ->map(fn($line) => trim($line))
            ->filter(fn($line) => strlen($line) > 5)
            ->values();

        if ($lines->isEmpty()) return $this->fallbackResponse();

        return [
            'title'      => Str::title(Str::limit($lines->first(), 50)),
            'summary'    => "Extracted instructions from raw operational logs.",
            // We map the lines to the 'Procedure' section so the UI isn't empty
            'sections'   => [
                [
                    'heading' => 'Procedure',
                    'content' => $lines->values()->all()
                ]
            ],
            'confidence' => 0.50,
            'method'     => 'rules_based'
        ];
    }

    /**
     * Fallback response when no text can be parsed.
     */
    protected function fallbackResponse(): array
    {
        return [
            'title'      => 'Unstructured Process Note',
            'summary'    => 'Manual review required.',
            'sections'   => [
                [
                    'heading' => 'Error',
                    'content' => 'Could not automatically parse the input. Please review the raw input manually.'
                ]
            ],
            'confidence' => 0.10,
            'method'     => 'fallback'
        ];
    }
}