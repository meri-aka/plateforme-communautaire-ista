<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Group;
use App\Models\User;
use Illuminate\Http\Request;

class GroupController extends Controller
{
    // GET /api/groups — list groups the user is in
    public function index(Request $request)
    {
        $groups = $request->user()
            ->groups()
            ->with(['latestMessage.user', 'members'])
            ->get()
            ->map(fn($g) => array_merge($g->toArray(), [
                'members_count' => $g->members->count(),
                'last_message'  => $g->latestMessage?->body,
                'last_at'       => $g->latestMessage?->created_at,
            ]));

        return response()->json($groups);
    }

    // POST /api/groups — create a group
    public function store(Request $request)
    {
        $request->validate([
            'name'       => 'required|string|max:100',
            'member_ids' => 'required|array|min:1',
            'member_ids.*' => 'exists:users,id',
        ]);

        $group = Group::create([
            'name'       => $request->name,
            'created_by' => $request->user()->id,
        ]);

        // Add creator as admin
        $group->members()->attach($request->user()->id, ['role' => 'admin']);

        // Add other members
        foreach ($request->member_ids as $userId) {
            if ($userId != $request->user()->id) {
                $group->members()->attach($userId, ['role' => 'member']);
            }
        }

        return response()->json($group->load(['members', 'creator']), 201);
    }

    // GET /api/groups/{group} — get group with messages
    public function show(Request $request, Group $group)
    {
        // Check membership
        if (!$group->members()->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $messages = $group->messages()->with('user')->orderBy('created_at', 'asc')->get();

        return response()->json([
            'group'    => $group->load(['members.filiere', 'creator']),
            'messages' => $messages,
        ]);
    }

    // POST /api/groups/{group}/members — add member
    public function addMember(Request $request, Group $group)
    {
        $request->validate(['user_id' => 'required|exists:users,id']);

        if (!$group->members()->where('user_id', $request->user()->id)->wherePivot('role', 'admin')->exists()) {
            return response()->json(['message' => 'Only admins can add members'], 403);
        }

        $group->members()->syncWithoutDetaching([$request->user_id => ['role' => 'member']]);

        return response()->json(['message' => 'Member added.']);
    }

    // DELETE /api/groups/{group}/members/{user} — remove member
    public function removeMember(Request $request, Group $group, User $user)
    {
        $isAdmin = $group->members()->where('user_id', $request->user()->id)->wherePivot('role', 'admin')->exists();
        $isSelf  = $request->user()->id === $user->id;

        if (!$isAdmin && !$isSelf) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $group->members()->detach($user->id);

        return response()->json(['message' => 'Member removed.']);
    }

    // DELETE /api/groups/{group} — delete group
    public function destroy(Request $request, Group $group)
    {
        if ($group->created_by !== $request->user()->id) {
            return response()->json(['message' => 'Only the creator can delete this group'], 403);
        }

        $group->delete();

        return response()->json(['message' => 'Group deleted.']);
    }
}