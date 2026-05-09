<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LostFound;
use App\Models\LostFoundMedia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LostFoundController extends Controller
{
    public function index()
    {
        $items = LostFound::with(['user', 'media'])
            ->latest()
            ->paginate(10);

        return response()->json($items);
    }

    public function store(Request $request)
    {
        $request->validate([
            'type'        => 'required|in:lost,found',
            'title'       => 'required|string|max:150',
            'description' => 'required|string',
            'location'    => 'nullable|string|max:150',
            'media'       => 'nullable|array',
            'media.*'     => 'file|mimes:jpeg,png,jpg,gif|max:10240',
        ]);

        $item = LostFound::create([
            'user_id'     => $request->user()->id,
            'type'        => $request->type,
            'title'       => $request->title,
            'description' => $request->description,
            'location'    => $request->location,
        ]);

        if ($request->hasFile('media')) {
            foreach ($request->file('media') as $index => $file) {
                $path = $file->store('lost-found', 'public');
                LostFoundMedia::create([
                    'lost_found_id' => $item->id,
                    'url'           => Storage::url($path),
                    'order'         => $index,
                ]);
            }
        }

        return response()->json($item->load(['user', 'media']), 201);
    }

    public function show(LostFound $lostFound)
    {
        return response()->json($lostFound->load(['user', 'media', 'claims.user']));
    }

    public function update(Request $request, LostFound $lostFound)
    {
        if ($request->user()->id !== $lostFound->user_id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'status' => 'sometimes|in:open,claimed,resolved',
            'title'       => 'sometimes|string|max:150',
            'description' => 'sometimes|string',
            'location'    => 'nullable|string|max:150',
        ]);

        $lostFound->update($request->only(['title', 'description', 'location', 'status']));

        return response()->json($lostFound->load(['user', 'media']));
    }

    public function destroy(Request $request, LostFound $lostFound)
    {
        if ($request->user()->id !== $lostFound->user_id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $lostFound->delete();

        return response()->json(['message' => 'Item deleted.']);
    }
}