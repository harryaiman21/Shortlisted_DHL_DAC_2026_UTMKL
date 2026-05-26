<?php

namespace App\Livewire;

use App\Models\RawInput;
use App\Services\RawInputProcessor;
use Livewire\Component;
use Livewire\WithFileUploads;
use App\Actions\ProcessRawInput;

class UploadForm extends Component
{
    use WithFileUploads;

    public $source_type = '';
    public $title = '';
    public $text = '';
    public $file;

    public function submit()
{
    $this->validate([
        'source_type' => 'required|string',
        'title' => 'nullable|string|max:255',
        'text' => 'nullable|string',
        'file' => 'nullable|file|max:10240',
    ]);

    $path = null;
    $mime = null;

    if ($this->file) {
        $path = $this->file->store('raw-inputs', 'public');
        $mime = $this->file->getMimeType();
    }

    $rawInput = RawInput::create([
        'user_id' => auth()->id(),
        'source_type' => $this->source_type,
        'title' => $this->title ?: null,
        'original_text' => $this->text ?: null,
        'file_path' => $path,
        'mime_type' => $mime,
        'status' => 'new',
    ]);

    // 1. Dispatch the job to the background queue
    ProcessRawInput::dispatch($rawInput);

    // 2. Flash a message explaining it's being processed
    session()->flash('success', "Upload successful. The AI is now generating your draft. Check the Drafts page in a moment.");

    // 3. Reset form and redirect
    $this->reset(['source_type', 'title', 'text', 'file']);
    $this->resetErrorBag();

    return redirect()->route('drafts.index');
}

    public function render()
    {
        return view('livewire.upload-form');
    }
}