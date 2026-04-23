<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use Illuminate\Http\Request;

class FeedbackController extends Controller
{
    public function index()
    {
        $feedbacks = Feedback::with('user')
            ->latest()
            ->paginate(10);

        return response()->json($feedbacks);
    }

    public function store(Request $request)
    {
        $request->validate([
            'content'  => 'required|string',
            'category' => 'nullable|in:infrastructure,teaching,administration,other',
        ]);

        $feedback = Feedback::create([
            'user_id'  => $request->user()->id,
            'content'  => $request->content,
            'category' => $request->category ?? 'other',
        ]);

        return response()->json($feedback->load('user'), 201);
    }

    public function update(Request $request, Feedback $feedback)
    {
        $request->validate([
            'status' => 'required|in:pending,reviewed,archived',
        ]);

        $feedback->update(['status' => $request->status]);

        return response()->json($feedback);
    }
}