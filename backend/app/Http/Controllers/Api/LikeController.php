<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    public function toggle(Request $request, Post $post)
    {
        $existing = $post->likes()->where('user_id', $request->user()->id)->first();

        if ($existing) {
            $existing->delete();
            return response()->json(['liked' => false, 'likes_count' => $post->likes()->count()]);
        }

        $post->likes()->create(['user_id' => $request->user()->id]);

        return response()->json(['liked' => true, 'likes_count' => $post->likes()->count()]);
    }
}