<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Group;
use App\Models\GroupMessage;
use Illuminate\Http\Request;

class GroupMessageController extends Controller
{
    // POST /api/groups/{group}/messages
    public function store(Request $request, Group $group)
    {
        if (!$group->members()->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate(['body' => 'required|string|max:2000']);

        $message = GroupMessage::create([
            'group_id' => $group->id,
            'user_id'  => $request->user()->id,
            'body'     => $request->body,
        ]);

        return response()->json($message->load('user'), 201);
    }
}