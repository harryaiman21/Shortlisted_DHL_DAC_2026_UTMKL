<div class="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
    <div class="mx-auto max-w-5xl">
        
        {{-- Main Editor Card --}}
        <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            
            {{-- Header Actions --}}
            <div class="border-b border-slate-100 bg-white px-8 py-6">
                <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p class="text-sm font-bold uppercase tracking-[0.2em] text-[#D40511]">Drafting Phase</p>
                        <h1 class="mt-1 text-3xl font-black text-slate-900 tracking-tight">Edit SOP Draft</h1>
                        <div class="mt-2 flex items-center gap-2">
                            <span class="text-xs font-bold uppercase text-slate-400">Origin:</span>
                            <span class="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold uppercase text-slate-600 border border-slate-200">
                                {{ $draft->rawInput->source_type }}
                            </span>
                        </div>
                    </div>

                    <div class="flex items-center gap-3">
                        <button wire:click="save" 
                                class="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
                            Save Progress
                        </button>
                        <button wire:click="publish" 
                                class="rounded-xl bg-[#D40511] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition hover:bg-[#A3040D] active:scale-95">
                            Publish to KB
                        </button>
                    </div>
                </div>
            </div>

            <div class="p-8">
                {{-- Success Notification --}}
                @if (session()->has('success'))
                    <div class="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-700 shadow-sm flex items-center gap-3">
                        <span class="font-bold text-lg">✓</span>
                        <span class="font-medium">{{ session('success') }}</span>
                    </div>
                @endif

                <div class="space-y-8">
                    {{-- Article Title --}}
                    <div>
                        <label class="mb-2 block text-sm font-bold text-slate-700 uppercase tracking-wide">Article Title</label>
                        <input type="text" wire:model="title" 
                               class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-lg font-bold text-slate-900 outline-none transition focus:border-[#D40511] focus:ring-4 focus:ring-[#D40511]/5"
                               placeholder="e.g., Global Express Shipping Protocol">
                    </div>

                    {{-- Executive Summary --}}
                    <div>
                        <label class="mb-2 block text-sm font-bold text-slate-700 uppercase tracking-wide">Executive Summary</label>
                        <textarea wire:model="summary" rows="3" 
                                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-600 outline-none transition focus:border-[#D40511] focus:ring-4 focus:ring-[#D40511]/5"
                                  placeholder="Provide a brief overview of this procedure..."></textarea>
                    </div>

                    <hr class="border-slate-100">

                    {{-- Dynamic Procedure Sections --}}
                    <div class="space-y-6">
                        <div class="flex items-center justify-between">
                            <h3 class="text-xl font-black text-slate-900 tracking-tight">Procedure Steps</h3>
                            <button wire:click="addSection" 
                                    class="flex items-center gap-2 rounded-xl bg-[#FFCC00]/20 px-4 py-2 text-sm font-bold text-[#D40511] transition hover:bg-[#FFCC00]/40">
                                <span class="text-lg">+</span> Add Section
                            </button>
                        </div>

                        <div class="space-y-4">
                            @foreach($sections as $index => $section)
                                <div class="group relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300">
                                    {{-- Delete Button --}}
                                    <button wire:click="removeSection({{ $index }})" 
                                            class="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100">
                                        &times;
                                    </button>

                                    <div class="grid grid-cols-1 gap-5">
                                        <div>
                                            <label class="mb-1 block text-xs font-black uppercase tracking-widest text-slate-400">Section Heading</label>
                                            <input type="text" 
                                                   wire:model="sections.{{ $index }}.heading" 
                                                   placeholder="e.g., Pre-loading Verification"
                                                   class="block w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00]/20">
                                        </div>
                                        
                                        <div>
                                            <label class="mb-1 block text-xs font-black uppercase tracking-widest text-slate-400">Content / Instructions</label>
                                            <textarea wire:model="sections.{{ $index }}.content" 
                                                      placeholder="Detail the specific steps for this section..."
                                                      rows="4" 
                                                      class="block w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00]/20"></textarea>
                                        </div>
                                        
                                        <div class="flex items-center gap-2">
                                            <div class="h-1.5 w-1.5 rounded-full bg-[#FFCC00]"></div>
                                            <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Tip: Use clear, imperative language (e.g., "Verify," "Check," "Scan")
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    </div>
                </div>
            </div>
            
            {{-- Footer Info --}}
            <div class="bg-slate-50 border-t border-slate-100 px-8 py-4">
                <p class="text-[10px] font-medium text-slate-400 text-center uppercase tracking-[0.2em]">
                    This draft is auto-saved locally. Finalize publication to make it visible to the operations team.
                </p>
            </div>
        </div>
    </div>
</div>