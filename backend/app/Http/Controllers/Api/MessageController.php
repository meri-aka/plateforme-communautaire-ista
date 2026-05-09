<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    // GET /api/messages — list all conversations for the logged-in user
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $conversations = Message::with(['sender', 'receiver'])
            ->where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy(function ($msg) use ($userId) {
                return $msg->sender_id === $userId
                    ? $msg->receiver_id
                    : $msg->sender_id;
            })
            ->map(function ($messages, $otherUserId) use ($userId) {
                $latest = $messages->first();
                $other  = $latest->sender_id === $userId
                    ? $latest->receiver
                    : $latest->sender;
                $unread = $messages->where('receiver_id', $userId)
                    ->where('is_read', false)->count();
                return [
                    'user'        => $other,
                    'last_message'=> $latest->body,
                    'last_at'     => $latest->created_at,
                    'unread'      => $unread,
                ];
            })
            ->values();

        return response()->json($conversations);
    }

    // GET /api/messages/{user} — get messages between logged-in user and another user
    public function show(Request $request, User $user)
    {
        $myId = $request->user()->id;

        // Mark received messages as read
        Message::where('sender_id', $user->id)
            ->where('receiver_id', $myId)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        $messages = Message::with(['sender', 'receiver'])
            ->where(function ($q) use ($myId, $user) {
                $q->where('sender_id', $myId)->where('receiver_id', $user->id);
            })
            ->orWhere(function ($q) use ($myId, $user) {
                $q->where('sender_id', $user->id)->where('receiver_id', $myId);
            })
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'messages' => $messages,
            'with'     => $user,
        ]);
    }

    public function store(Request $request, User $user)
    {
        $request->validate([
            'body'  => 'nullable|string|max:2000',
            'image' => 'nullable|image|max:5120',
        ]);

        if (!$request->body && !$request->hasFile('image')) {
            return response()->json(['message' => 'Message cannot be empty.'], 422);
        }

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('messages', 'public');
        }

        $message = Message::create([
            'sender_id'   => $request->user()->id,
            'receiver_id' => $user->id,
            'body'        => $request->body,
            'image'       => $imagePath,
        ]);

        return response()->json($message->load(['sender', 'receiver']), 201);
    }

    // DELETE /api/messages/{message} — delete a message
    public function destroy(Request $request, Message $message)
    {
        if ($message->sender_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $message->delete();
        return response()->json(['message' => 'Deleted.']);
    }
}