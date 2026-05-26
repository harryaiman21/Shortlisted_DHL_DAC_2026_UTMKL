<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name', 'DHL KB') }}</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @livewireStyles

    <style>
        /* The Dotted Grid */
        .bg-grid {
            background-image: radial-gradient(circle, #cbd5e1 1px, transparent 1px);
            background-size: 40px 40px;
        }

        /* The DHL Diagonal Speed Stripes - very subtle */
        .bg-stripes {
            background: repeating-linear-gradient(
                45deg,
                #FFCC00 0,
                #FFCC00 1px,
                transparent 0,
                transparent 50%
            );
            background-size: 10px 10px;
        }
    </style>
</head>
<body class="bg-slate-50 text-slate-900 antialiased font-sans overflow-x-hidden">
    
    {{-- Design Background Layer --}}
    <div class="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        
        {{-- 1. Main Grid --}}
        <div class="absolute inset-0 bg-grid opacity-40"></div>

        {{-- 2. Subtle Yellow Diagonal Pattern (Top-Left and Bottom-Right) --}}
        <div class="absolute top-0 left-0 w-1/3 h-1/3 bg-stripes opacity-[0.07]"></div>
        <div class="absolute bottom-0 right-0 w-1/3 h-1/3 bg-stripes opacity-[0.07]"></div>

        {{-- 3. Large Branding Glows --}}
        <div class="absolute -top-[10%] -right-[5%] h-[600px] w-[600px] rounded-full bg-[#D40511]/5 blur-[120px]"></div>
        <div class="absolute -bottom-[10%] -left-[5%] h-[600px] w-[600px] rounded-full bg-[#FFCC00]/15 blur-[120px]"></div>

        {{-- 4. Technical Markers (The "+" signs) --}}
        <div class="absolute top-20 left-20 text-[#FFCC00]/40 font-light text-2xl">+</div>
        <div class="absolute top-20 right-20 text-[#FFCC00]/40 font-light text-2xl">+</div>
        <div class="absolute bottom-20 left-20 text-[#FFCC00]/40 font-light text-2xl">+</div>
        <div class="absolute bottom-20 right-20 text-[#FFCC00]/40 font-light text-2xl">+</div>

        {{-- 5. Abstract Yellow Accent Bar --}}
        <div class="absolute top-1/4 -left-12 w-24 h-1 bg-[#FFCC00]/30 rounded-full rotate-45"></div>
        <div class="absolute bottom-1/4 -right-12 w-24 h-1 bg-[#FFCC00]/30 rounded-full rotate-45"></div>
    </div>

    {{-- Main Content Layer --}}
    <div class="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <div class="w-full max-w-md">
            
            {{-- LOGO ANCHOR --}}
            <div class="flex justify-center mb-10">
                <div class="relative group">
                    {{-- Outer pulse --}}
                    <div class="absolute -inset-1.5 rounded-2xl bg-[#FFCC00]/20 blur-md opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                    
                    <div class="relative flex h-16 w-32 items-center justify-center rounded-2xl bg-[#FFCC00] shadow-2xl shadow-[#FFCC00]/40 border border-[#FFCC00]">
                        <img src="{{ asset('images/dhl-logo.svg') }}" 
                             class="h-10 w-auto object-contain px-2" 
                             alt="DHL Logo">
                    </div>
                </div>
            </div>

            {{-- THE PAGE CONTENT --}}
            <div class="transition-all duration-700">
                {{ $slot }}
            </div>

            {{-- Side Metadata Decoration --}}
            <div class="mt-12 flex items-center justify-center gap-4 opacity-20">
                <div class="h-px w-8 bg-slate-400"></div>
                <p class="text-[9px] font-black uppercase tracking-[0.5em] text-slate-500">
                    Secure Terminal Access
                </p>
                <div class="h-px w-8 bg-slate-400"></div>
            </div>
        </div>
    </div>
</body>
</html>