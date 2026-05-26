<x-app-layout>
    <div class="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
        <div class="mx-auto max-w-7xl">
            
            {{-- Header & Search --}}
            <div class="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                    <p class="text-sm font-bold uppercase tracking-[0.3em] text-[#D40511]">Draft Review Queue</p>
                    <h1 class="mt-3 text-3xl font-black text-slate-900 tracking-tight md:text-4xl">Drafts</h1>
                    <p class="mt-3 text-slate-500 max-w-xl">
                        Review and refine AI-cleaned SOP drafts before finalizing them for the knowledge base.
                    </p>
                </div>

                <form method="GET" class="w-full md:max-w-md">
                    <div class="relative">
                        <input
                            type="text"
                            name="search"
                            value="{{ $search }}"
                            placeholder="Search drafts..."
                            class="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-900 shadow-sm outline-none transition focus:border-[#FFCC00] focus:ring-4 focus:ring-[#FFCC00]/10"
                        >
                        <div class="absolute right-4 top-4 text-slate-400">
                            🔍
                        </div>
                    </div>
                </form>
            </div>

            {{-- Drafts Grid --}}
            <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                @forelse ($drafts as $draft)
                    <div class="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-slate-300">
                        <div class="flex items-center justify-between gap-3">
                            <span class="rounded-lg bg-[#FFCC00]/20 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#D40511] border border-[#FFCC00]/50">
                                {{ $draft->status }}
                            </span>

                            <span class="text-xs font-bold text-slate-400">
                                #{{ $draft->id }}
                            </span>
                        </div>

                        <h2 class="mt-5 text-xl font-bold text-slate-900 leading-tight">
                            {{ $draft->title }}
                        </h2>

                        <p class="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-500">
                            {{ $draft->summary ?: 'No summary available for this draft.' }}
                        </p>

                        {{-- Metadata Section --}}
                        <div class="mt-6 space-y-3 border-t border-slate-50 pt-5">
                            <div class="flex justify-between text-xs">
                                <span class="font-bold uppercase tracking-wider text-slate-400">Source Type</span>
                                <span class="font-bold capitalize text-slate-700">{{ $draft->rawInput->source_type ?? 'N/A' }}</span>
                            </div>

                            <div class="flex justify-between text-xs">
                                <span class="font-bold uppercase tracking-wider text-slate-400">AI Confidence</span>
                                <div class="flex items-center gap-2">
                                    <div class="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden">
                                        <div class="h-full bg-[#FFCC00]" style="width: {{ ($draft->confidence_score ?? 0) * 100 }}%"></div>
                                    </div>
                                    <span class="font-bold text-slate-700">{{ number_format(($draft->confidence_score ?? 0) * 100, 0) }}%</span>
                                </div>
                            </div>

                            <div class="flex justify-between text-xs">
                                <span class="font-bold uppercase tracking-wider text-slate-400">Generated</span>
                                <span class="font-bold text-slate-700">{{ $draft->created_at->diffForHumans() }}</span>
                            </div>
                        </div>

                        {{-- Footer Actions --}}
                        <div class="mt-auto flex items-center justify-between pt-6">
                            <div class="flex items-center gap-1.5">
                                <div class="h-2 w-2 rounded-full {{ $draft->article ? 'bg-emerald-500' : 'bg-amber-400' }}"></div>
                                <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {{ $draft->article ? 'Published' : 'Awaiting Review' }}
                                </span>
                            </div>

                            <a href="{{ route('drafts.show', $draft) }}"
                               class="rounded-xl bg-[#D40511] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/10 transition hover:bg-[#A3040D] active:scale-95">
                                Open Draft
                            </a>
                        </div>
                    </div>
                @empty
                    <div class="rounded-3xl border border-dashed border-slate-200 bg-white p-16 text-center md:col-span-2 xl:col-span-3">
                        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-3xl">
                            📂
                        </div>
                        <h3 class="text-lg font-bold text-slate-900">No Drafts Found</h3>
                        <p class="mt-1 text-sm text-slate-500">There are currently no items in the review queue.</p>
                    </div>
                @endforelse
            </div>

            {{-- Pagination --}}
            <div class="mt-10">
                {{ $drafts->links() }}
            </div>
        </div>
    </div>
</x-app-layout>