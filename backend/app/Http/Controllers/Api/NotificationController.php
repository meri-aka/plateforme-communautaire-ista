<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->paginate(20);

        return response()->json($notifications);
    }

    public function markRead(Request $request, $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->update(['is_read' => true]);

        return response()->json(['message' => 'Marked as read.']);
    }

    public function markAllRead(Request $request)
    {
        $request->user()->notifications()->update(['is_read' => true]);

        return response()->json(['message' => 'All marked as read.']);
    }
    public function destroy(Request $request, $id)
{
    $request->user()->notifications()->findOrFail($id)->delete();
    return response()->json(['message' => 'Notification deleted.']);
}
}