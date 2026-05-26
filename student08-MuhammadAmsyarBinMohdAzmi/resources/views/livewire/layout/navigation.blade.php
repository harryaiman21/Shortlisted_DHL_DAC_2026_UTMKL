<?php

use App\Livewire\Actions\Logout;
use Livewire\Volt\Component;

new class extends Component
{
    /**
     * Log the current user out of the application.
     */
    public function logout(Logout $logout): void
    {
        $logout();

        $this->redirect('/', navigate: true);
    }
};

$currentRoute = request()->route()?->getName();
?>

<div class="border-b border-slate-200 bg-white">
    <div class="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        {{-- LEFT SIDE --}}
        <div class="flex items-center gap-10">

{{-- LOGO / BRAND --}}
<a href="{{ route('dashboard') }}" class="flex items-center gap-6 group">
    {{-- Titan Scale Yellow Container --}}
    <div class="flex h-16 w-25 items-center justify-center rounded-[1.25rem] bg-[#FFCC00] shadow-xl shadow-[#FFCC00]/30 transition-all group-hover:scale-105">
        {{-- Maximum Zoom --}}
        <img src="{{ asset('images/dhl-logo.svg') }}" 
             class="h-12 w-auto object-contain px-1" 
             alt="DHL Logo">
    </div>

    {{-- System Label - Adjusted for the larger logo --}}
    <div class="hidden lg:block border-l-[3px] border-slate-200 pl-6">
        <p class="text-[14px] font-[1000] uppercase tracking-[0.4em] text-[#D40511] leading-none">
            Operations
        </p>
        <h1 class="mt-2  font-[1000] tracking-tighter text-slate-900 leading-none">
            Knowledge Console
        </h1>
    </div>
</a>

            {{-- NAV LINKS --}}
            <nav class="hidden items-center gap-2 lg:flex">

                <a href="{{ route('dashboard') }}"
                   class="rounded-xl px-4 py-2 text-sm font-medium transition
                   {{ request()->routeIs('dashboard')
                        ? 'bg-[#FFCC00]/15 text-[#FFCC00] ring-1 ring-[#FFCC00]/20'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                   }}">
                    Dashboard
                </a>

                <a href="{{ route('upload') }}"
                   class="rounded-xl px-4 py-2 text-sm font-medium transition
                   {{ request()->routeIs('upload')
                        ? 'bg-[#FFCC00]/15 text-[#FFCC00] ring-1 ring-[#FFCC00]/20'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                   }}">
                    Upload
                </a>

                <a href="{{ route('inbox') }}"
                   class="rounded-xl px-4 py-2 text-sm font-medium transition
                   {{ request()->routeIs('inbox')
                        ? 'bg-[#FFCC00]/15 text-[#FFCC00] ring-1 ring-[#FFCC00]/20'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                   }}">
                    Inbox
                </a>

                <a href="{{ route('drafts.index') }}"
                   class="rounded-xl px-4 py-2 text-sm font-medium transition
                   {{ request()->routeIs('drafts.*')
                        ? 'bg-[#FFCC00]/15 text-[#FFCC00] ring-1 ring-[#FFCC00]/20'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                   }}">
                    Drafts
                </a>

                <a href="{{ route('articles.index') }}"
                   class="rounded-xl px-4 py-2 text-sm font-medium transition
                   {{ request()->routeIs('articles.*')
                        ? 'bg-[#FFCC00]/15 text-[#FFCC00] ring-1 ring-[#FFCC00]/20'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                   }}">
                    Articles
                </a>

                <a href="{{ route('profile') }}"
                   class="rounded-xl px-4 py-2 text-sm font-medium transition
                   {{ request()->routeIs('profile')
                        ? 'bg-[#FFCC00]/15 text-[#FFCC00] ring-1 ring-[#FFCC00]/20'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                   }}">
                    Profile
                </a>

                <a href="{{ route('logs.index') }}"
                class="rounded-xl px-4 py-2 text-sm font-medium transition
                {{ request()->routeIs('logs.*')
                        ? 'bg-[#FFCC00]/15 text-[#FFCC00] ring-1 ring-[#FFCC00]/20'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }}">
                    Logs
                </a>

            </nav>
        </div>

        {{-- RIGHT SIDE --}}
        <div class="flex items-center gap-4">

            {{-- USER --}}
            <!-- Change from the dark cyan pill to a clean gray one -->
<div class="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 md:flex">
    <div class="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFCC00] text-sm font-semibold text-[#D40511]">
        {{ strtoupper(substr(auth()->user()->name ?? 'U', 0, 1)) }}
    </div>
    <div>
        <p class="text-sm font-medium text-slate-900">{{ auth()->user()->name }}</p>
        <p class="text-xs text-slate-500">{{ auth()->user()->email }}</p>
    </div>
</div>

            {{-- LOGOUT --}}
<button
    wire:click="logout"
    class="rounded-2xl border border-[#D40511]/20 bg-[#D40511]/10 px-4 py-2 text-sm font-bold uppercase tracking-wider text-[#D40511] transition hover:bg-[#D40511] hover:text-white"
>
    Logout
</button>

        </div>
    </div>

    {{-- MOBILE NAV --}}
    <div class="border-t border-white/5 px-4 py-3 lg:hidden">
        <div class="flex flex-wrap gap-2">

            <a href="{{ route('dashboard') }}"
               class="rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-300">
                Dashboard
            </a>

            <a href="{{ route('upload') }}"
               class="rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-300">
                Upload
            </a>

            <a href="{{ route('inbox') }}"
               class="rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-300">
                Inbox
            </a>

            <a href="{{ route('drafts.index') }}"
               class="rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-300">
                Drafts
            </a>

            <a href="{{ route('articles.index') }}"
               class="rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-300">
                Articles
            </a>
            
            <a href="{{ route('logs.index') }}"
            class="rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-300">
                Logs
            </a>
        </div>
    </div>
</div>