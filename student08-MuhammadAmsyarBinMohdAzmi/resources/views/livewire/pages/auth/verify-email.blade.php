<?php

use App\Livewire\Actions\Logout;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Livewire\Attributes\Layout;
use Livewire\Volt\Component;

new #[Layout('layouts.guest')] class extends Component
{
    public function sendVerification(): void
    {
        if (Auth::user()->hasVerifiedEmail()) {
            $this->redirectIntended(default: route('dashboard', absolute: false), navigate: true);
            return;
        }

        Auth::user()->sendEmailVerificationNotification();

        Session::flash('status', 'verification-link-sent');
    }

    public function logout(Logout $logout): void
    {
        $logout();

        $this->redirect('/', navigate: true);
    }
}; ?>

<div class="relative mt-8">
    {{-- Branding Header --}}
    <div class="mb-8 text-center">
        <p class="text-[10px] font-black uppercase tracking-[0.3em] text-[#D40511]">
            Security Protocol
        </p>
        <h1 class="mt-2 text-3xl font-black tracking-tight text-slate-900">
            Verify Email
        </h1>
    </div>

    {{-- Verification Card --}}
    <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
        {{-- Vertical Brand Accent --}}
        <div class="absolute left-0 top-0 h-full w-1.5 bg-[#FFCC00]"></div>

        {{-- Instruction Text --}}
        <div class="mb-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-medium leading-relaxed text-slate-600">
            {{ __('Welcome to the Knowledge Console. Before accessing operational data, please click the link we just emailed to you. If you didn\'t receive it, we can dispatch another.') }}
        </div>

        @if (session('status') == 'verification-link-sent')
            <div class="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
                {{ __('A fresh verification link has been dispatched to your corporate address.') }}
            </div>
        @endif

        <div class="flex flex-col gap-4">
            {{-- Resend Button --}}
            <button wire:click="sendVerification" class="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-[#D40511] px-4 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-[#A3040D] hover:shadow-lg active:scale-[0.98]">
                {{ __('Resend Verification') }}
                <span class="ml-2 transition-transform group-hover:translate-x-1">→</span>
            </button>

            {{-- Logout / Cancel --}}
            <button wire:click="logout" type="button" class="flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-600">
                {{ __('Log Out') }}
            </button>
        </div>
    </div>

    {{-- Footer Note --}}
    <p class="mt-8 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
        Awaiting Validation — DHL Global IT Services
    </p>
</div>