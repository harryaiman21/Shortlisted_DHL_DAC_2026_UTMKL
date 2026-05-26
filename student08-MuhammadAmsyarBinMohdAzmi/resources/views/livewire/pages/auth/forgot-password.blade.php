<?php

use Illuminate\Support\Facades\Password;
use Livewire\Attributes\Layout;
use Livewire\Volt\Component;

new #[Layout('layouts.guest')] class extends Component
{
    public string $email = '';

    public function sendPasswordResetLink(): void
    {
        $this->validate([
            'email' => ['required', 'string', 'email'],
        ]);

        $status = Password::sendResetLink($this->only('email'));

        if ($status != Password::RESET_LINK_SENT) {
            $this->addError('email', __($status));
            return;
        }

        $this->reset('email');

        session()->flash('status', __($status));
    }
}; ?>

<div class="relative mt-8">
    {{-- Branding Header --}}
    <div class="mb-8 text-center">
        <p class="text-[10px] font-black uppercase tracking-[0.3em] text-[#D40511]">
            DHL Operations
        </p>
        <h1 class="mt-2 text-3xl font-black tracking-tight text-slate-900">
            Account Recovery
        </h1>
    </div>

    {{-- Recovery Card --}}
    <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
        {{-- Vertical Brand Accent --}}
        <div class="absolute left-0 top-0 h-full w-1.5 bg-[#FFCC00]"></div>

        {{-- Instruction Text --}}
        <div class="mb-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-medium leading-relaxed text-slate-600">
            {{ __('Forgotten credentials? Enter your corporate email below and we will dispatch a secure reset link to your inbox.') }}
        </div>

        @if (session('status'))
            <div class="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
                {{ session('status') }}
            </div>
        @endif

        <form wire:submit="sendPasswordResetLink" class="space-y-6">
            {{-- Email --}}
            <div>
                <label for="email" class="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">
                    {{ __('Corporate Email') }}
                </label>
                <input
                    wire:model="email"
                    id="email"
                    type="email"
                    name="email"
                    required
                    autofocus
                    placeholder="name@dhl.com"
                    class="block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:border-[#FFCC00] focus:ring-4 focus:ring-[#FFCC00]/10 transition-all"
                />
                <x-input-error :messages="$errors->get('email')" class="mt-2" />
            </div>

            {{-- Submit --}}
            <button type="submit" class="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-[#D40511] px-4 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-[#A3040D] hover:shadow-lg active:scale-[0.98]">
                {{ __('Send Reset Link') }}
                <span class="ml-2 transition-transform group-hover:translate-x-1">→</span>
            </button>

            {{-- Back to Login --}}
            <p class="text-center text-xs font-bold uppercase tracking-tighter text-slate-400">
                Remembered your password?
                <a href="{{ route('login') }}" wire:navigate class="ml-1 text-[#D40511] hover:underline">
                    Return to Login
                </a>
            </p>
        </form>
    </div>

    {{-- Footer Note --}}
    <p class="mt-8 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
        System ID: {{ request()->ip() }} — Security Protocol Active
    </p>
</div>