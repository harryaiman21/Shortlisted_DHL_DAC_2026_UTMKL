<?php

use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Livewire\Attributes\Layout;
use Livewire\Attributes\Locked;
use Livewire\Volt\Component;

new #[Layout('layouts.guest')] class extends Component
{
    #[Locked]
    public string $token = '';
    public string $email = '';
    public string $password = '';
    public string $password_confirmation = '';

    public function mount(string $token): void
    {
        $this->token = $token;
        $this->email = request()->string('email');
    }

    public function resetPassword(): void
    {
        $this->validate([
            'token' => ['required'],
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string', 'confirmed', Rules\Password::defaults()],
        ]);

        $status = Password::reset(
            $this->only('email', 'password', 'password_confirmation', 'token'),
            function ($user) {
                $user->forceFill([
                    'password' => Hash::make($this->password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status != Password::PASSWORD_RESET) {
            $this->addError('email', __($status));
            return;
        }

        Session::flash('status', __($status));

        $this->redirectRoute('login', navigate: true);
    }
}; ?>

<div class="relative mt-8">
    {{-- Branding Header --}}
    <div class="mb-8 text-center">
        <p class="text-[10px] font-black uppercase tracking-[0.3em] text-[#D40511]">
            DHL Operations
        </p>
        <h1 class="mt-2 text-3xl font-black tracking-tight text-slate-900">
            Secure Update
        </h1>
    </div>

    {{-- Reset Card --}}
    <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
        {{-- Vertical Brand Accent --}}
        <div class="absolute left-0 top-0 h-full w-1.5 bg-[#FFCC00]"></div>

        <form wire:submit="resetPassword" class="space-y-5">
            {{-- Email (Read-only feel but editable if needed) --}}
            <div>
                <label for="email" class="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">
                    {{ __('Confirm Corporate Email') }}
                </label>
                <input
                    wire:model="email"
                    id="email"
                    type="email"
                    name="email"
                    required
                    readonly
                    class="block w-full rounded-2xl border-slate-200 bg-slate-100 px-4 py-3.5 text-slate-500 cursor-not-allowed font-medium transition-all"
                />
                <x-input-error :messages="$errors->get('email')" class="mt-2" />
            </div>

            {{-- New Password --}}
            <div>
                <label for="password" class="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">
                    {{ __('New Password') }}
                </label>
                <input
                    wire:model="password"
                    id="password"
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    class="block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:border-[#FFCC00] focus:ring-4 focus:ring-[#FFCC00]/10 transition-all"
                />
                <x-input-error :messages="$errors->get('password')" class="mt-2" />
            </div>

            {{-- Confirm Password --}}
            <div>
                <label for="password_confirmation" class="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">
                    {{ __('Confirm New Password') }}
                </label>
                <input
                    wire:model="password_confirmation"
                    id="password_confirmation"
                    type="password"
                    name="password_confirmation"
                    required
                    placeholder="••••••••"
                    class="block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:border-[#FFCC00] focus:ring-4 focus:ring-[#FFCC00]/10 transition-all"
                />
                <x-input-error :messages="$errors->get('password_confirmation')" class="mt-2" />
            </div>

            {{-- Submit --}}
            <div class="pt-2">
                <button type="submit" class="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-[#D40511] px-4 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-[#A3040D] hover:shadow-lg active:scale-[0.98]">
                    {{ __('Update Credentials') }}
                    <span class="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </button>
            </div>
        </form>
    </div>

    {{-- Footer Note --}}
    <p class="mt-8 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
        Password requirements: Minimum 8 characters with complexity.
    </p>
</div>