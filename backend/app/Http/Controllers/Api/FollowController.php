<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class FollowController extends Controller
{
    public function toggle(Request $request, User $user)
    {
        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'You cannot follow yourself.'], 422);
        }

        $existing = $request->user()->following()->where('following_id', $user->id)->first();

        if ($existing) {
            $existing->delete();
            return response()->json(['following' => false]);
        }

        $request->user()->following()->create(['following_id' => $user->id]);

        return response()->json(['following' => true]);
    }
}