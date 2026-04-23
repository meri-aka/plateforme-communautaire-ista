<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\PostMedia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    public function index()
    {
        $posts = Post::with(['user.filiere', 'media'])
            ->withCount(['likes', 'comments'])
            ->latest()
            ->paginate(10);

        return response()->json($posts);
    }

    public function store(Request $request)
    {
        $request->validate([
            'content' => 'required|string',
            'media'   => 'nullable|array',
            'media.*' => 'file|mimes:jpeg,png,jpg,gif,mp4|max:20480',
        ]);

        $post = Post::create([
            'user_id' => $request->user()->id,
            'content' => $request->content,
        ]);

        if ($request->hasFile('media')) {
            foreach ($request->file('media') as $index => $file) {
                $path = $file->store('posts', 'public');
                PostMedia::create([
                    'post_id' => $post->id,
                    'url'     => Storage::url($path),
                    'type'    => str_starts_with($file->getMimeType(), 'video') ? 'video' : 'image',
                    'order'   => $index,
                ]);
            }
        }

        return response()->json($post->load(['user.filiere', 'media', 'likes', 'comments']), 201);
    }

    public function show(Post $post)
    {
        return response()->json($post->load(['user.filiere', 'media', 'likes', 'comments.user']));
    }

    public function update(Request $request, Post $post)
    {
        if ($request->user()->id !== $post->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'content' => 'required|string',
        ]);

        $post->update(['content' => $request->content]);

        return response()->json($post->load(['user.filiere', 'media', 'likes', 'comments']));
    }

    public function destroy(Request $request, Post $post)
    {
        if ($request->user()->id !== $post->user_id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $post->delete();

        return response()->json(['message' => 'Post deleted.']);
    }
}