<?php

namespace App\Livewire;

use App\Models\RawInput;
use Livewire\Component;

class InboxTable extends Component
{
    public function render()
    {
        return view('livewire.inbox-table', [
            'items' => RawInput::with('drafts')->latest()->get(),
        ]);
    }
}