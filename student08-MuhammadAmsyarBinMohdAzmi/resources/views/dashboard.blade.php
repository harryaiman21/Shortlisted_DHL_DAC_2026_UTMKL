<x-app-layout>
    <div class="min-h-screen bg-slate-50 text-slate-900">
        <div class="mx-auto max-w-7xl px-6 py-12">
            
            {{-- Header Section --}}
            <div class="mb-12">
                <p class="text-sm font-black uppercase tracking-[0.3em] text-[#D40511]">
                    DHL Operations
                </p>
                <h1 class="mt-3 text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
                    Knowledge Console
                </h1>
                <p class="mt-4 max-w-2xl text-lg text-slate-500 leading-relaxed font-medium">
                    Transforming field data into standardized operational intelligence.
                </p>
            </div>

            {{-- Statistics Grid --}}
            <div class="mb-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                @php
                    $stats = [
                        ['label' => 'Raw Inputs', 'value' => $rawInputs, 'accent' => 'bg-slate-400', 'sub' => 'Total Received'],
                        ['label' => 'Drafts', 'value' => $drafts, 'accent' => 'bg-[#FFCC00]', 'sub' => 'Pending Review'],
                        ['label' => 'Published Articles', 'value' => $publishedArticles, 'accent' => 'bg-emerald-500', 'sub' => 'Live in KB'],
                        ['label' => 'Failed Steps', 'value' => $failedLogs, 'accent' => 'bg-[#D40511]', 'sub' => 'Action Required'],
                    ];
                @endphp

                @foreach($stats as $stat)
                <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                    {{-- Vertical Accent Bar instead of Icon --}}
                    <div class="absolute left-0 top-0 h-full w-1.5 {{ $stat['accent'] }}"></div>
                    
                    <div class="ml-2">
                        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{{ $stat['label'] }}</p>
                        <p class="mt-3 text-4xl font-black text-slate-900 leading-none">{{ number_format($stat['value']) }}</p>
                        <p class="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ $stat['sub'] }}</p>
                    </div>
                </div>
                @endforeach
            </div>

            {{-- Action Grid --}}
            <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                
                {{-- Upload Card --}}
                <a href="{{ route('upload') }}" class="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-[#FFCC00] hover:shadow-xl">
                    <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all group-hover:bg-[#FFCC00]/20 group-hover:text-[#D40511]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-7 h-7">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                    </div>
                    <h2 class="mt-6 text-2xl font-black tracking-tight text-slate-900">Upload Raw Input</h2>
                    <p class="mt-3 text-sm leading-relaxed text-slate-500 font-medium">
                        Initiate the AI transformation pipeline for new logs, images, or documents.
                    </p>
                    <div class="mt-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#D40511] opacity-0 transition-opacity group-hover:opacity-100">
                        Start Upload <span>→</span>
                    </div>
                </a>

                {{-- Inbox Card --}}
                <a href="{{ route('inbox') }}" class="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-[#FFCC00] hover:shadow-xl">
                    <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all group-hover:bg-[#FFCC00]/20 group-hover:text-[#D40511]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-7 h-7">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                    </div>
                    <h2 class="mt-6 text-2xl font-black tracking-tight text-slate-900">Raw Input Inbox</h2>
                    <p class="mt-3 text-sm leading-relaxed text-slate-500 font-medium">
                        Monitor incoming items and track the automated extraction status.
                    </p>
                    <div class="mt-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#D40511] opacity-0 transition-opacity group-hover:opacity-100">
                        Open Inbox <span>→</span>
                    </div>
                </a>

                {{-- Drafts Card --}}
                <a href="{{ route('drafts.index') }}" class="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-[#FFCC00] hover:shadow-xl">
                    <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all group-hover:bg-[#FFCC00]/20 group-hover:text-[#D40511]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-7 h-7">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                    </div>
                    <h2 class="mt-6 text-2xl font-black tracking-tight text-slate-900">Drafts Editor</h2>
                    <p class="mt-3 text-sm leading-relaxed text-slate-500 font-medium">
                        Review AI-cleaned SOPs and finalize content for global publication.
                    </p>
                    <div class="mt-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#D40511] opacity-0 transition-opacity group-hover:opacity-100">
                        Review Drafts <span>→</span>
                    </div>
                </a>

                {{-- Articles Card --}}
                <a href="{{ route('articles.index') }}" class="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-[#FFCC00] hover:shadow-xl">
                    <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all group-hover:bg-[#FFCC00]/20 group-hover:text-[#D40511]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-7 h-7">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
                        </svg>
                    </div>
                    <h2 class="mt-6 text-2xl font-black tracking-tight text-slate-900">Published KB</h2>
                    <p class="mt-3 text-sm leading-relaxed text-slate-500 font-medium">
                        Access finalized, standardized procedures ready for operational use.
                    </p>
                    <div class="mt-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#D40511] opacity-0 transition-opacity group-hover:opacity-100">
                        View Library <span>→</span>
                    </div>
                </a>

                {{-- Logs Card --}}
                <a href="{{ route('logs.index') }}" class="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-[#FFCC00] hover:shadow-xl">
                    <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all group-hover:bg-[#FFCC00]/20 group-hover:text-[#D40511]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-7 h-7">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 8.25V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18V8.25m-18 0V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v2.25m-18 0h18M5.25 6h.008v.008H5.25V6zM7.5 6h.008v.008H7.5V6zm2.25 0h.008v.008H9.75V6z" />
                        </svg>
                    </div>
                    <h2 class="mt-6 text-2xl font-black tracking-tight text-slate-900">System Logs</h2>
                    <p class="mt-3 text-sm leading-relaxed text-slate-500 font-medium">
                        Monitor the system audit trail and troubleshoot extraction pipeline events.
                    </p>
                    <div class="mt-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#D40511] opacity-0 transition-opacity group-hover:opacity-100">
                        Audit Trail <span>→</span>
                    </div>
                </a>

                {{-- Profile Card --}}
                <a href="{{ route('profile') }}" class="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-[#FFCC00] hover:shadow-xl">
                    <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all group-hover:bg-[#FFCC00]/20 group-hover:text-[#D40511]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-7 h-7">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.105a8.25 8.25 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                    </div>
                    <h2 class="mt-6 text-2xl font-black tracking-tight text-slate-900">Account</h2>
                    <p class="mt-3 text-sm leading-relaxed text-slate-500 font-medium">
                        Manage your console preferences, security settings, and access levels.
                    </p>
                    <div class="mt-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#D40511] opacity-0 transition-opacity group-hover:opacity-100">
                        User Settings <span>→</span>
                    </div>
                </a>

            </div>
        </div>
    </div>
</x-app-layout>