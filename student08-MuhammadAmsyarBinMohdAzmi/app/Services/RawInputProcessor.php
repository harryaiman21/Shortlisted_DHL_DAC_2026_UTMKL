<?php

namespace App\Services;

use App\Models\ArticleDraft;
use App\Models\ProcessingLog;
use App\Models\RawInput;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class RawInputProcessor
{
    public function process(RawInput $rawInput): ArticleDraft
    {
        $this->log($rawInput->id, 'received', 'Raw input received for processing.');

        $text = $this->extractText($rawInput);
        $this->log($rawInput->id, 'text_extraction', 'Text extracted from raw input.', [
            'length' => Str::length($text),
        ]);

        $title = $this->generateTitle($rawInput, $text);
        $summary = $this->generateSummary($text);
        $sections = $this->generateSections($text);

        $draft = ArticleDraft::create([
            'raw_input_id' => $rawInput->id,
            'title' => $title,
            'summary' => $summary,
            'body_json' => [
                'source_type' => $rawInput->source_type,
                'sections' => $sections,
                'raw_text' => $text,
            ],
            'confidence_score' => $this->estimateConfidence($text),
            'status' => 'drafted',
            'created_by' => $rawInput->user_id,
        ]);

        $rawInput->update([
            'status' => 'processed',
            'title' => $rawInput->title ?: $title,
        ]);

        $this->log($rawInput->id, 'draft_created', 'Draft article created successfully.', [
            'draft_id' => $draft->id,
        ]);

        return $draft;
    }

    protected function extractText(RawInput $rawInput): string
    {
        if (!empty($rawInput->original_text)) {
            return trim($rawInput->original_text);
        }

        if (!$rawInput->file_path) {
            return '';
        }

        $fullPath = Storage::disk('public')->path($rawInput->file_path);

        if (!file_exists($fullPath)) {
            return '';
        }

        if (str_starts_with((string) $rawInput->mime_type, 'text/')) {
            return trim(File::get($fullPath));
        }

        return "File uploaded ({$rawInput->mime_type}) but automatic text extraction is not implemented yet.";
    }

    protected function generateTitle(RawInput $rawInput, string $text): string
    {
        if (!empty($rawInput->title)) {
            return $rawInput->title;
        }

        $firstLine = collect(preg_split("/\r\n|\n|\r/", trim($text)))
            ->filter()
            ->first();

        if ($firstLine) {
            return Str::headline(Str::limit($firstLine, 80, ''));
        }

        return 'Untitled SOP Draft';
    }

    protected function generateSummary(string $text): string
    {
        $clean = trim(preg_replace('/\s+/', ' ', $text));

        if ($clean === '') {
            return 'No usable text was provided.';
        }

        return Str::limit($clean, 220, '...');
    }

    protected function generateSections(string $text): array
    {
        $lines = collect(preg_split("/\r\n|\n|\r/", $text))
            ->map(fn ($line) => trim($line))
            ->filter()
            ->values();

        $bulletLines = $lines->filter(fn ($line) => preg_match('/^(-|\*|\d+\.)\s+/', $line))->values();

        $steps = $bulletLines->isNotEmpty()
            ? $bulletLines->map(function ($line) {
                return preg_replace('/^(-|\*|\d+\.)\s+/', '', $line);
            })->values()->all()
            : $lines->take(5)->values()->all();

        return [
            [
                'heading' => 'Purpose',
                'content' => 'This article was generated from raw operational input and should be reviewed before publishing.',
            ],
            [
                'heading' => 'Procedure',
                'content' => $steps ?: ['Review the source message and convert it into clear operational steps.'],
            ],
            [
                'heading' => 'Notes',
                'content' => 'Verify accuracy, update placeholders, and remove incomplete instructions before publishing.',
            ],
        ];
    }

    protected function estimateConfidence(string $text): float
    {
        $length = Str::length(trim($text));

        if ($length === 0) {
            return 0.10;
        }

        if ($length < 100) {
            return 0.45;
        }

        if ($length < 500) {
            return 0.70;
        }

        return 0.85;
    }

    protected function log(int $rawInputId, string $stepName, string $message, array $metadata = []): void
    {
        ProcessingLog::create([
            'raw_input_id' => $rawInputId,
            'step_name' => $stepName,
            'status' => 'success',
            'message' => $message,
            'metadata_json' => $metadata,
        ]);
    }
}