<?php

use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Livewire\Attributes\Layout;
use Livewire\Volt\Component;

new #[Layout('layouts.guest')] class extends Component
{
    public string $name = '';
    public string $email = '';
    public string $password = '';
    public string $password_confirmation = '';

    public function register(): void
    {
        $validated = $this->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'string', 'confirmed', Rules\Password::defaults()],
        ]);

        $validated['password'] = Hash::make($validated['password']);

        event(new Registered($user = User::create($validated)));

        Auth::login($user);

        $this->redirect(route('dashboard', absolute: false), navigate: true);
    }
}; ?>

<div class="relative mt-8">
    {{-- Branding Header --}}
    <div class="mb-8 text-center">
        <p class="text-[10px] font-black uppercase tracking-[0.3em] text-[#D40511]">
            DHL Operations
        </p>
        <h1 class="mt-2 text-3xl font-black tracking-tight text-slate-900">
            Create Account
        </h1>
    </div>

    {{-- Registration Card --}}
    <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
        {{-- Vertical Brand Accent --}}
        <div class="absolute left-0 top-0 h-full w-1.5 bg-[#FFCC00]"></div>

        <form wire:submit="register" class="space-y-5">
            {{-- Name --}}
            <div>
                <label for="name" class="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">
                    {{ __('Full Name') }}
                </label>
                <input
                    wire:model="name"
                    id="name"
                    type="text"
                    name="name"
                    required
                    autofocus
                    placeholder="John Doe"
                    class="block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-[#FFCC00] focus:ring-4 focus:ring-[#FFCC00]/10 transition-all"
                />
                <x-input-error :messages="$errors->get('name')" class="mt-2" />
            </div>

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
                    placeholder="name@dhl.com"
                    class="block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-[#FFCC00] focus:ring-4 focus:ring-[#FFCC00]/10 transition-all"
                />
                <x-input-error :messages="$errors->get('email')" class="mt-2" />
            </div>

            {{-- Password Grid --}}
            <div class="grid gap-5 md:grid-cols-2">
                <div>
                    <label for="password" class="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">
                        {{ __('Password') }}
                    </label>
                    <input
                        wire:model="password"
                        id="password"
                        type="password"
                        name="password"
                        required
                        placeholder="••••••••"
                        class="block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-[#FFCC00] focus:ring-4 focus:ring-[#FFCC00]/10 transition-all"
                    />
                    <x-input-error :messages="$errors->get('password')" class="mt-2" />
                </div>

                <div>
                    <label for="password_confirmation" class="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">
                        {{ __('Confirm') }}
                    </label>
                    <input
                        wire:model="password_confirmation"
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        required
                        placeholder="••••••••"
                        class="block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-[#FFCC00] focus:ring-4 focus:ring-[#FFCC00]/10 transition-all"
                    />
                    <x-input-error :messages="$errors->get('password_confirmation')" class="mt-2" />
                </div>
            </div>

            {{-- Submit --}}
            <div class="pt-2">
                <button type="submit" class="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-[#D40511] px-4 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-[#A3040D] hover:shadow-lg active:scale-[0.98]">
                    {{ __('Request Access') }}
                    <span class="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </button>
            </div>

            {{-- Login Link --}}
            <p class="text-center text-xs font-bold uppercase tracking-tighter text-slate-400">
                Already registered?
                <a href="{{ route('login') }}" wire:navigate class="ml-1 text-[#D40511] hover:underline">
                    Sign In
                </a>
            </p>
        </form>
    </div>

    {{-- Footer Note --}}
    <p class="mt-8 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
        Secured by DHL Global IT Services
    </p>
</div>