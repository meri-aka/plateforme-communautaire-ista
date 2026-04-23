<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index(Post $post)
    {
        $comments = $post->comments()
            ->with(['user', 'replies.user'])
            ->whereNull('parent_id')
            ->latest()
            ->get();

        return response()->json($comments);
    }

    public function store(Request $request, Post $post)
    {
        $request->validate([
            'content'   => 'required|string',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        $comment = Comment::create([
            'user_id'   => $request->user()->id,
            'post_id'   => $post->id,
            'parent_id' => $request->parent_id,
            'content'   => $request->content,
        ]);

        return response()->json($comment->load('user'), 201);
    }

    public function destroy(Request $request, Comment $comment)
    {
        if ($request->user()->id !== $comment->user_id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Comment deleted.']);
    }
}