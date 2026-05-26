<x-app-layout>
    <div class="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
        <div class="mx-auto max-w-4xl">
            
            {{-- Header Section --}}
            <div class="mb-8">
                <p class="text-sm font-bold uppercase tracking-[0.3em] text-[#D40511]">Account Management</p>
                <h1 class="mt-3 text-3xl font-black tracking-tight text-slate-900">User Profile</h1>
                <p class="mt-3 text-slate-500">
                    Secure access and personal information for the DHL Knowledge Console.
                </p>
            </div>

            <div class="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
                
                {{-- Left Column: User Summary Card --}}
                <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div class="flex items-center gap-5">
                        <div class="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#FFCC00] shadow-md shadow-[#FFCC00]/20">
                            <span class="text-2xl font-black text-[#D40511]">
                                {{ strtoupper(substr(auth()->user()->name ?? 'U', 0, 1)) }}
                            </span>
                        </div>

                        <div>
                            <h2 class="text-xl font-bold text-slate-900">
                                {{ auth()->user()->name ?? 'Amsyar' }}
                            </h2>
                            <p class="text-sm font-medium text-slate-500">{{ auth()->user()->email }}</p>
                        </div>
                    </div>

                    <div class="mt-8 space-y-3 text-sm">
                        <div class="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                            <span class="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Status</span>
                            <span class="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase text-emerald-700 border border-emerald-200">
                                Active
                            </span>
                        </div>

                        <div class="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                            <span class="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Role</span>
                            <span class="font-bold text-slate-700">Operations User</span>
                        </div>

                        <div class="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                            <span class="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Last Login</span>
                            <span class="font-bold text-slate-700">Recently</span>
                        </div>
                    </div>
                </div>

                {{-- Right Column: Detailed Information --}}
                <div class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <h2 class="text-lg font-black text-slate-900 uppercase tracking-tight">System Identity</h2>
                    <p class="mt-2 text-sm text-slate-500 leading-relaxed">
                        This information is verified against the corporate directory for access control.
                    </p>

                    <div class="mt-8 space-y-5">
                        <div class="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 transition hover:border-[#FFCC00]">
                            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Email Address</p>
                            <p class="mt-1 text-sm font-bold text-slate-900">{{ auth()->user()->email }}</p>
                        </div>

                        <div class="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 transition hover:border-[#FFCC00]">
                            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Full Name</p>
                            <p class="mt-1 text-sm font-bold text-slate-900">{{ auth()->user()->name ?? 'Amsyar' }}</p>
                        </div>

                        <div class="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 transition hover:border-[#FFCC00]">
                            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Access Scope</p>
                            <div class="mt-2 flex flex-wrap gap-2">
                                @foreach(['Dashboard', 'Inbox', 'Drafts', 'Articles'] as $scope)
                                    <span class="rounded-lg bg-white border border-slate-200 px-2 py-1 text-[10px] font-bold text-slate-600">
                                        {{ $scope }}
                                    </span>
                                @endforeach
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {{-- Security Footer --}}
            <div class="mt-10 rounded-2xl bg-slate-100 p-6 text-center border border-slate-200">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Need to change your password or permissions? 
                    <a href="mailto:it-support@dhl.com" class="ml-2 text-[#D40511] hover:underline">Contact System Admin</a>
                </p>
            </div>
        </div>
    </div>
</x-app-layout>