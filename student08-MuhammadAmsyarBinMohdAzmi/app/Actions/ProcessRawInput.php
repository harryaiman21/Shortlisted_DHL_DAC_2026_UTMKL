<?php

namespace App\Actions; // Changed to Jobs for standard practice

use App\Models\RawInput;
use App\Models\ArticleDraft;
use App\Models\ProcessingLog;
use App\Services\TransformationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use thiagoalessio\TesseractOCR\TesseractOCR;
use Exception;

class ProcessRawInput implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $rawInput;

    public function __construct(RawInput $rawInput)
    {
        $this->rawInput = $rawInput;
    }

    public function handle(TransformationService $transformer): void
    {
        try {
            $this->rawInput->update(['status' => 'processing']);
            $this->log($this->rawInput, 'Started background processing');

            $textToProcess = $this->rawInput->original_text ?? "";

            if ($this->shouldRunOCR($this->rawInput)) {
                $this->log($this->rawInput, 'Running OCR extraction...', 'ocr');
                $textToProcess = $this->runOcr($this->rawInput->file_path);
                $this->rawInput->update(['original_text' => $textToProcess]);
            }

            if (empty(trim($textToProcess))) {
                throw new Exception("Input text is empty.");
            }

            $result = $transformer->transform($textToProcess);

            $draft = ArticleDraft::create([
                'raw_input_id'     => $this->rawInput->id,
                'title'            => $result['title'],
                'summary'          => $result['summary'],
                'body_json'        => [
                    'sections' => $result['sections'], // Matches the Service above
                    'method'   => $result['method']
                ],
                'confidence_score' => $result['confidence'],
                'status'           => 'generated',
                'created_by'       => $this->rawInput->user_id,
            ]);

            $this->rawInput->update(['status' => 'drafted']);
            $this->log($this->rawInput, "Draft created successfully.", 'completion');

        } catch (Exception $e) {
            $this->rawInput->update(['status' => 'failed']);
            $this->log($this->rawInput, 'Error: ' . $e->getMessage(), 'error', 'error');
        }
    }

    protected function shouldRunOCR(RawInput $rawInput): bool
    {
        return !empty($rawInput->file_path) && empty($rawInput->original_text);
    }

    protected function runOcr(string $filePath): string
    {
        $fullPath = storage_path('app/public/' . $filePath);
        return (new TesseractOCR($fullPath))
            ->executable('/usr/bin/tesseract')
            ->psm(6)
            ->run();
    }

    protected function log($rawInput, $message, $step = 'processing', $level = 'info'): void
    {
        ProcessingLog::create([
            'raw_input_id' => $rawInput->id,
            'step_name'    => $step,
            'level'        => $level,
            'message'      => $message,
        ]);
    }
}