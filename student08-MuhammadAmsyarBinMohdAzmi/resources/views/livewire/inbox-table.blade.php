<div class="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
    <div class="mx-auto max-w-7xl">
        
        {{-- Header Section --}}
        <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
                <p class="text-sm font-bold uppercase tracking-[0.3em] text-[#D40511]">
                    Raw Input Monitoring
                </p>
                <h1 class="mt-3 text-3xl font-bold text-slate-900 tracking-tight">
                    Raw Input Inbox
                </h1>
                <p class="mt-3 text-slate-500">
                    Review uploaded operational content and monitor processing status across the pipeline.
                </p>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 shadow-sm">
                Total Inputs: 
                <span class="ml-1 font-bold text-slate-900">
                    {{ $items->count() }}
                </span>
            </div>
        </div>

        {{-- Table Card --}}
        <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div class="overflow-x-auto">
                <table class="min-w-full">
                    <thead class="bg-slate-50 border-b border-slate-200">
                        <tr class="text-left text-xs uppercase tracking-wider text-slate-500">
                            <th class="px-6 py-4 font-bold">ID</th>
                            <th class="px-6 py-4 font-bold">Title & Preview</th>
                            <th class="px-6 py-4 font-bold">Source</th>
                            <th class="px-6 py-4 font-bold">Status</th>
                            <th class="px-6 py-4 font-bold">Created</th>
                        </tr>
                    </thead>

                    <tbody class="divide-y divide-slate-100">
                        @forelse($items as $item)
                            <tr class="transition hover:bg-slate-50/80">
                                <td class="px-6 py-5 text-sm font-medium text-slate-400">
                                    #{{ $item->id }}
                                </td>

                                <td class="px-6 py-5">
                                    <div class="font-bold text-slate-900">
                                        {{ $item->title ?? 'Untitled Input' }}
                                    </div>
                                    @if($item->original_text)
                                        <div class="mt-1 max-w-md truncate text-sm text-slate-500">
                                            {{ \Illuminate\Support\Str::limit($item->original_text, 80) }}
                                        </div>
                                    @endif
                                </td>

                                <td class="px-6 py-5">
                                    <span class="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-600 border border-slate-200">
                                        {{ $item->source_type }}
                                    </span>
                                </td>

                                <td class="px-6 py-5">
                                    @php
                                        $badge = match ($item->status) {
                                            'drafted' => 'bg-emerald-100 text-emerald-700 border-emerald-200',
                                            'processing' => 'bg-[#FFCC00]/20 text-[#D40511] border-[#FFCC00]/50',
                                            'failed' => 'bg-red-100 text-red-700 border-red-200',
                                            'published' => 'bg-indigo-100 text-indigo-700 border-indigo-200',
                                            default => 'bg-amber-100 text-amber-700 border-amber-200',
                                        };
                                    @endphp

                                    <span class="inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide border {{ $badge }}">
                                        {{ $item->status }}
                                    </span>
                                </td>

                                <td class="px-6 py-5 text-sm text-slate-500">
                                    {{ $item->created_at->diffForHumans() }}
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="5" class="px-6 py-20 text-center">
                                    <div class="flex flex-col items-center">
                                        <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-2xl shadow-inner text-slate-400">
                                            📥
                                        </div>
                                        <h3 class="text-xl font-bold text-slate-900">
                                            Inbox is Empty
                                        </h3>
                                        <p class="mt-2 max-w-xs text-sm text-slate-500">
                                            No operational content has been uploaded yet. Start by adding a new input.
                                        </p>
                                        <a href="{{ route('upload') }}"
                                           class="mt-8 rounded-2xl bg-[#D40511] px-8 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition hover:bg-[#A3040D]">
                                            Upload First Input
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>