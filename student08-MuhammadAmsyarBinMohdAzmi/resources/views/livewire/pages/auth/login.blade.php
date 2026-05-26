<?php

use App\Livewire\Forms\LoginForm;
use Illuminate\Support\Facades\Session;
use Livewire\Attributes\Layout;
use Livewire\Volt\Component;

new #[Layout('layouts.guest')] class extends Component
{
    public LoginForm $form;

    public function login(): void
    {
        $this->validate();

        $this->form->authenticate();

        Session::regenerate();

        $this->redirectIntended(default: route('dashboard', absolute: false), navigate: true);
    }
}; ?>

<div class="relative mt-8">
    {{-- Branding Header --}}
    <div class="mb-8 text-center">
        <p class="text-[10px] font-black uppercase tracking-[0.3em] text-[#D40511]">
            DHL Operations
        </p>
        <h1 class="mt-2 text-3xl font-black tracking-tight text-slate-900">
            Knowledge Console
        </h1>
    </div>

    {{-- Login Card --}}
    <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
        {{-- Vertical Brand Accent (Matching Dashboard Stats) --}}
        <div class="absolute left-0 top-0 h-full w-1.5 bg-[#FFCC00]"></div>

        @if (session('status'))
            <div class="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
                {{ session('status') }}
            </div>
        @endif

        <form wire:submit="login" class="space-y-6">
            {{-- Email --}}
            <div>
                <label for="email" class="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">
                    {{ __('Corporate Email') }}
                </label>
                <input
                    wire:model="form.email"
                    id="email"
                    type="email"
                    name="email"
                    required
                    autofocus
                    placeholder="name@dhl.com"
                    class="block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:border-[#FFCC00] focus:ring-4 focus:ring-[#FFCC00]/10 transition-all"
                />
                <x-input-error :messages="$errors->get('form.email')" class="mt-2" />
            </div>

            {{-- Password --}}
            <div>
                <div class="flex items-center justify-between mb-2">
                    <label for="password" class="block text-xs font-black uppercase tracking-widest text-slate-400">
                        {{ __('Password') }}
                    </label>
                    @if (Route::has('password.request'))
                        <a class="text-xs font-bold text-[#D40511] hover:underline" href="{{ route('password.request') }}" wire:navigate>
                            {{ __('Forgot Password?') }}
                        </a>
                    @endif
                </div>
                <input
                    wire:model="form.password"
                    id="password"
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    class="block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:border-[#FFCC00] focus:ring-4 focus:ring-[#FFCC00]/10 transition-all"
                />
                <x-input-error :messages="$errors->get('form.password')" class="mt-2" />
            </div>

            {{-- Remember Me --}}
            <div class="flex items-center">
                <label for="remember" class="inline-flex items-center cursor-pointer">
                    <input
                        wire:model="form.remember"
                        id="remember"
                        type="checkbox"
                        class="h-5 w-5 rounded-lg border-slate-300 text-[#D40511] focus:ring-[#FFCC00]"
                        name="remember"
                    >
                    <span class="ml-3 text-sm font-medium text-slate-500">{{ __('Stay signed in') }}</span>
                </label>
            </div>

            {{-- Submit --}}
            <button type="submit" class="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-[#D40511] px-4 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-[#A3040D] hover:shadow-lg active:scale-[0.98]">
                {{ __('Access Console') }}
                <span class="ml-2 transition-transform group-hover:translate-x-1">→</span>
            </button>

            {{-- Registration Link --}}
            <p class="text-center text-xs font-bold uppercase tracking-tighter text-slate-400">
                Authorized Personnel Only. 
                <a href="{{ route('register') }}" wire:navigate class="ml-1 text-[#D40511] hover:underline">
                    Request Access
                </a>
            </p>
        </form>
    </div>

    {{-- Footer Note --}}
    <p class="mt-8 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
        © {{ date('Y') }} DHL International GmbH — Internal Use
    </p>
</div>