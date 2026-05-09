<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Claim;
use App\Models\LostFound;
use Illuminate\Http\Request;

class ClaimController extends Controller
{
    public function index()
    {
        $claims = Claim::with(['user', 'lostFound'])
            ->latest()
            ->paginate(10);

        return response()->json($claims);
    }

    public function store(Request $request, LostFound $lostFound)
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        $existing = $lostFound->claims()->where('user_id', $request->user()->id)->first();

        if ($existing) {
            return response()->json(['message' => 'You already claimed this item.'], 422);
        }

        $claim = Claim::create([
            'lost_found_id' => $lostFound->id,
            'user_id'       => $request->user()->id,
            'message'       => $request->message,
        ]);

        return response()->json($claim->load(['user', 'lostFound']), 201);
    }

    public function update(Request $request, Claim $claim)
    {
        $request->validate([
            'status' => 'required|in:pending,approved,rejected',
        ]);

        $claim->update(['status' => $request->status]);

        if ($request->status === 'approved') {
            $claim->lostFound->update(['status' => 'claimed']);
        }

        return response()->json($claim->load(['user', 'lostFound']));
    }
}