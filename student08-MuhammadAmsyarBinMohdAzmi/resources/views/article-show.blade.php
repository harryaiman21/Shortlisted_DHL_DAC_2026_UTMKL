<x-app-layout>
    <div class="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
        <div class="mx-auto max-w-5xl">

            {{-- Navigation & Header --}}
            <div class="mb-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div>
                    <div class="flex items-center gap-2">
                        <p class="text-xs font-black uppercase tracking-[0.3em] text-[#D40511]">Official SOP</p>
                        <span class="text-slate-300">•</span>
                        <span class="text-xs font-bold text-slate-400">KB-{{ str_pad($article->id, 5, '0', STR_PAD_LEFT) }}</span>
                    </div>
                    <h1 class="mt-4 text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
                        {{ $article->title }}
                    </h1>
                    <div class="mt-4 flex items-center gap-4 text-sm text-slate-500">
                        <div class="flex items-center gap-1.5">
                            <span class="text-slate-400 font-medium">Published:</span>
                            <span class="font-bold text-slate-700">{{ $article->published_at?->format('F d, Y') }}</span>
                        </div>
                        <span class="text-slate-200">|</span>
                        <div class="flex items-center gap-1.5">
                            <span class="text-slate-400 font-medium">By:</span>
                            <span class="font-bold text-slate-700">{{ $article->published_by ?? 'System Administrator' }}</span>
                        </div>
                    </div>
                </div>

                <a href="{{ route('articles.index') }}"
                   class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 shadow-sm">
                    <span>←</span>
                    Back to Knowledge Base
                </a>
            </div>

            {{-- Article Content --}}
            <div class="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
                {{-- Decorative Brand Accent --}}
                <div class="h-2 w-full bg-gradient-to-r from-[#D40511] via-[#FFCC00] to-[#D40511]"></div>

                <div class="p-8 md:p-16">
                    {{-- Typography Layer --}}
                    <article class="prose prose-slate max-w-none
                        prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-900
                        prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-lg
                        prose-li:text-slate-600 prose-strong:text-slate-900 prose-strong:font-bold
                        prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-4 prose-h2:mt-12
                        prose-img:rounded-3xl prose-img:shadow-lg">

                        {!! $article->content_html !!}
                    </article>

                    {{-- Footer Verification --}}
                    <div class="mt-20 border-t border-slate-100 pt-10">
                        <div class="flex flex-col items-center justify-between gap-6 md:flex-row">
                            <div class="flex items-center gap-4">
                                <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFCC00]/10 text-[#D40511]">
                                    🛡️
                                </div>
                                <div>
                                    <p class="text-xs font-black uppercase tracking-widest text-slate-400">Verification</p>
                                    <p class="text-sm font-bold text-slate-700">Certified Operations Content</p>
                                </div>
                            </div>

                            <button onclick="window.print()" class="text-xs font-bold uppercase tracking-widest text-slate-400 transition hover:text-[#D40511]">
                                Print or Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
