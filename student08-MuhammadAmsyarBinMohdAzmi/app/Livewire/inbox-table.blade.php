<div class="p-6">

    <h1 class="text-2xl font-bold mb-6">
        Raw Input Inbox
    </h1>

    <div class="overflow-x-auto bg-white rounded shadow">

        <table class="min-w-full border-collapse">

            <thead class="bg-gray-100">
                <tr>
                    <th class="p-3 text-left">ID</th>
                    <th class="p-3 text-left">Title</th>
                    <th class="p-3 text-left">Source Type</th>
                    <th class="p-3 text-left">Status</th>
                    <th class="p-3 text-left">Created</th>
                </tr>
            </thead>

            <tbody>

                @forelse($items as $item)
                    <tr class="border-t">

                        <td class="p-3">
                            {{ $item->id }}
                        </td>

                        <td class="p-3">
                            {{ $item->title ?? 'Untitled' }}
                        </td>

                        <td class="p-3 capitalize">
                            {{ $item->source_type }}
                        </td>

                        <td class="p-3">
                            <span class="px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                                {{ $item->status }}
                            </span>
                        </td>

                        <td class="p-3">
                            {{ $item->created_at->diffForHumans() }}
                        </td>

                    </tr>
                @empty
                    <tr>
                        <td colspan="5" class="p-6 text-center text-gray-500">
                            No raw inputs uploaded yet.
                        </td>
                    </tr>
                @endforelse

            </tbody>

        </table>

    </div>

</div>