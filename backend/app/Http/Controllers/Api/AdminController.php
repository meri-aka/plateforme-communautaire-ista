<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Post;
use App\Models\Feedback;
use App\Models\LostFound;
use App\Models\Report;
use App\Models\ActivityLog;
use App\Models\Setting;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function stats()
    {
        return response()->json([
            'users' => [
                'total'      => User::count(),
                'stagiaires' => User::where('role', 'stagiaire')->count(),
                'formateurs' => User::where('role', 'formateur')->count(),
                'new_today'  => User::whereDate('created_at', today())->count(),
            ],
            'posts' => [
                'total'     => Post::count(),
                'today'     => Post::whereDate('created_at', today())->count(),
            ],
            'feedbacks' => [
                'total'    => Feedback::count(),
                'pending'  => Feedback::where('status', 'pending')->count(),
            ],
            'lost_found' => [
                'total'    => LostFound::count(),
                'open'     => LostFound::where('status', 'open')->count(),
            ],
            'reports' => [
                'total'    => Report::count(),
                'pending'  => Report::where('status', 'pending')->count(),
            ],
        ]);
    }

    public function posts(Request $request)
    {
        $query = Post::with(['user.filiere', 'media'])->latest();

        if ($request->filled('reported')) {
            $query->where('reported', $request->boolean('reported'));
        }

        if ($request->filled('search')) {
            $query->where('content', 'like', '%' . $request->search . '%');
        }

        return response()->json($query->paginate(20));
    }

    public function showPost(Post $post)
    {
        return response()->json($post->load(['user.filiere', 'media', 'comments.user', 'likes.user']));
    }

    public function updatePostReported(Request $request, Post $post)
    {
        $request->validate([
            'reported' => 'required|boolean',
        ]);

        $post->update(['reported' => $request->boolean('reported')]);

        return response()->json([
            'message' => 'Post reported status updated.',
            'post'    => $post->fresh()->load(['user.filiere', 'media']),
        ]);
    }

    public function destroyPost(Post $post)
    {
        $post->delete();

        return response()->json(['message' => 'Post deleted.']);
    }

    public function logs(Request $request)
    {
        $query = ActivityLog::with('user')->latest();

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        return response()->json($query->paginate(50));
    }

    public function settings()
    {
        $settings = Setting::all()->pluck('value', 'key');
        return response()->json($settings);
    }

    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            '*.key'   => 'required|string',
            '*.value' => 'required',
        ]);

        foreach ($validated as $setting) {
            Setting::set($setting['key'], $setting['value']);
        }

        $settings = Setting::all()->pluck('value', 'key');
        return response()->json([
            'message' => 'Settings updated.',
            'settings' => $settings,
        ]);
    }
}