<div class="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
    <div class="mx-auto max-w-4xl">
        {{-- Header Section --}}
        <div class="mb-8">
            <p class="text-sm font-bold uppercase tracking-[0.3em] text-[#D40511]">Input Capture</p>
            <h1 class="mt-3 text-3xl font-bold text-slate-900 tracking-tight">Upload Raw Input</h1>
            <p class="mt-3 text-slate-500">
                Paste text or upload files to start transforming messy information into a clean SOP draft.
            </p>
        </div>

        {{-- Success Alert --}}
        @if (session()->has('success'))
            <div class="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-700 shadow-sm">
                <div class="flex items-center gap-3">
                    <span class="text-lg">✅</span>
                    <span class="font-medium">{{ session('success') }}</span>
                </div>
            </div>
        @endif

        {{-- Form Card --}}
        <div class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <form wire:submit.prevent="submit" class="space-y-6">
                
                {{-- Source Type --}}
                <div>
                    <label class="mb-2 block text-sm font-bold text-slate-700">Source Type</label>
                    <select wire:model="source_type"
                            class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#D40511] focus:ring-4 focus:ring-[#D40511]/5">
                        <option value="">Select source</option>
                        <option value="email">Email</option>
                        <option value="chat">Chat</option>
                        <option value="screenshot">Screenshot</option>
                        <option value="note">Note</option>
                        <option value="slide">Slide</option>
                        <option value="file">File</option>
                    </select>
                    @error('source_type') <span class="mt-2 block text-sm font-semibold text-red-600">{{ $message }}</span> @enderror
                </div>

                {{-- Title --}}
                <div>
                    <label class="mb-2 block text-sm font-bold text-slate-700">Title</label>
                    <input type="text" wire:model="title"
                           class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#D40511] focus:ring-4 focus:ring-[#D40511]/5"
                           placeholder="Enter a descriptive title for this input">
                </div>

                {{-- Paste Text Area --}}
                <div>
                    <label class="mb-2 block text-sm font-bold text-slate-700">Paste Text Content</label>
                    <textarea wire:model="text" rows="10"
                              class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#D40511] focus:ring-4 focus:ring-[#D40511]/5"
                              placeholder="Paste email content, chat logs, or instructions here..."></textarea>
                </div>

                {{-- File Upload --}}
                <div>
                    <label class="mb-2 block text-sm font-bold text-slate-700">Upload Attachments</label>
                    <div class="relative">
                        <input type="file" wire:model="file"
                               class="block w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-slate-500 
                                      file:mr-4 file:rounded-xl file:border-0 file:bg-[#FFCC00] file:px-4 file:py-2 
                                      file:text-sm file:font-bold file:text-[#D40511] hover:file:opacity-90 transition">
                    </div>
                    @error('file') <span class="mt-2 block text-sm font-semibold text-red-600">{{ $message }}</span> @enderror
                </div>

                {{-- Submit Button --}}
                <div class="flex items-center justify-end pt-4">
                    <button type="submit"
                            class="rounded-2xl bg-[#D40511] px-10 py-4 font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:bg-[#A3040D] hover:shadow-red-500/30 active:scale-95">
                        Upload and Process
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>