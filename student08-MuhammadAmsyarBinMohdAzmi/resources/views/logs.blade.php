<x-app-layout>
    <div class="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
        <div class="mx-auto max-w-7xl">
            
            {{-- Header & Search --}}
            <div class="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                    <p class="text-sm font-black uppercase tracking-[0.3em] text-[#D40511]">System Audit Trail</p>
                    <h1 class="mt-3 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Processing Logs</h1>
                    <p class="mt-3 text-slate-500 max-w-xl">
                        Real-time tracking of the transformation pipeline from raw operational data to structured SOPs.
                    </p>
                </div>

                <form method="GET" class="w-full md:max-w-md">
                    <div class="relative">
                        <input
                            type="text"
                            name="search"
                            value="{{ $search }}"
                            placeholder="Filter by message or input..."
                            class="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-900 shadow-sm outline-none transition focus:border-[#FFCC00] focus:ring-4 focus:ring-[#FFCC00]/10"
                        >
                        <div class="absolute right-4 top-4 text-slate-400">
                            🔍
                        </div>
                    </div>
                </form>
            </div>

            {{-- Logs Table --}}
            <div class="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                <div class="overflow-x-auto">
                    <table class="min-w-full text-left">
                        <thead class="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            <tr>
                                <th class="px-8 py-5">Ref ID</th>
                                <th class="px-6 py-5">Source Input</th>
                                <th class="px-6 py-5">Pipeline Step</th>
                                <th class="px-6 py-5">Status</th>
                                <th class="px-6 py-5">Activity Message</th>
                                <th class="px-8 py-5 text-right">Timestamp</th>
                            </tr>
                        </thead>

                        <tbody class="divide-y divide-slate-50">
                            @forelse ($logs as $log)
                                <tr class="group transition hover:bg-slate-50/80">
                                    <td class="px-8 py-5 text-xs font-bold text-slate-400 group-hover:text-[#D40511]">
                                        #{{ $log->id }}
                                    </td>

                                    <td class="px-6 py-5">
                                        <div class="font-bold text-slate-900">
                                            {{ $log->rawInput->title ?? 'Untitled Input' }}
                                        </div>
                                        <div class="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                            {{ $log->rawInput->source_type ?? 'N/A' }}
                                        </div>
                                    </td>

                                    <td class="px-6 py-5">
                                        <span class="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold uppercase text-slate-600 border border-slate-200">
                                            {{ str_replace('_', ' ', $log->step_name) }}
                                        </span>
                                    </td>

                                    <td class="px-6 py-5">
                                        @php
                                            $badge = match ($log->status) {
                                                'success' => 'bg-emerald-100 text-emerald-700 border-emerald-200',
                                                'failed' => 'bg-red-100 text-red-700 border-red-200',
                                                'warning' => 'bg-amber-100 text-amber-700 border-amber-200',
                                                default => 'bg-slate-100 text-slate-600 border-slate-200',
                                            };
                                        @endphp
                                        <span class="inline-flex rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border {{ $badge }}">
                                            {{ $log->status }}
                                        </span>
                                    </td>

                                    <td class="px-6 py-5 text-sm text-slate-600 leading-relaxed max-w-xs truncate lg:max-w-md">
                                        {{ $log->message }}
                                    </td>

                                    <td class="px-8 py-5 text-right text-xs font-bold text-slate-400">
                                        {{ $log->created_at->diffForHumans() }}
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="6" class="px-6 py-20 text-center">
                                        <div class="text-3xl">📄</div>
                                        <h3 class="mt-4 text-lg font-bold text-slate-900">No records found</h3>
                                        <p class="text-sm text-slate-500">System activities will appear here once processing begins.</p>
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>

            {{-- Pagination --}}
            <div class="mt-8">
                {{ $logs->links() }}
            </div>
        </div>
    </div>
</x-app-layout>