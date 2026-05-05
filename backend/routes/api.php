<?php
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AdminLogController;
use App\Http\Controllers\Api\AdminSettingsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\LikeController;
use App\Http\Controllers\Api\FollowController;
use App\Http\Controllers\Api\LostFoundController;
use App\Http\Controllers\Api\ClaimController;
use App\Http\Controllers\Api\FeedbackController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\MessageController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\GroupController;
use App\Http\Controllers\Api\GroupMessageController;


// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);
    Route::patch('/me',    [AuthController::class, 'updateMe']);

    // Filieres
    Route::get('filieres', fn() => response()->json(\App\Models\Filiere::all()));

    // Users — static routes MUST come before {user} wildcard
    Route::get('users/online', function (Request $request) {
        $users = \App\Models\User::where('id', '!=', $request->user()->id)
            ->whereNotNull('last_seen')
            ->where('last_seen', '>=', now()->subMinutes(5))
            ->select('id', 'name', 'avatar', 'role', 'last_seen')
            ->get()
            ->map(fn($u) => array_merge($u->toArray(), ['is_online' => true]));
        return response()->json($users);
    });

    Route::get('users/search', function (Request $request) {
        $q = $request->query('q', '');
        $users = \App\Models\User::where('id', '!=', $request->user()->id)
            ->where(function ($query) use ($q) {
                $query->where('name', 'like', "%$q%")
                      ->orWhere('email', 'like', "%$q%");
            })
            ->select('id', 'name', 'avatar', 'role', 'filiere_id', 'last_seen')
            ->with('filiere')
            ->limit(20)
            ->get()
            ->map(fn($u) => array_merge($u->toArray(), [
                'is_online' => $u->last_seen && $u->last_seen->gt(now()->subMinutes(5))
            ]));
        return response()->json($users);
    });

    // Single user profile with follow status
    Route::get('users/{user}', function (\App\Models\User $user, Request $request) {
        $isFollowing = $user->followers()->where('follower_id', $request->user()->id)->exists();
        return response()->json(array_merge($user->load('filiere')->toArray(), [
            'is_following'    => $isFollowing,
            'followers_count' => $user->followers()->count(),
            'following_count' => $user->following()->count(),
        ]));
    });

    Route::get('users/online', function (Request $request) {
    $users = \App\Models\User::where('id', '!=', $request->user()->id)
        ->whereNotNull('last_seen')
        ->orderBy('last_seen', 'desc')
        ->select('id', 'name', 'avatar', 'role', 'last_seen')
        ->limit(5)
        ->get()
        ->map(fn($u) => array_merge($u->toArray(), [
            'is_online' => $u->last_seen->gt(now()->subMinutes(5))
        ]));
    return response()->json($users);
});

    Route::post('users/{user}/follow', [FollowController::class, 'toggle']);

    // Posts
    Route::apiResource('posts', PostController::class);
    Route::post('posts/{post}/like',     [LikeController::class, 'toggle']);
    Route::get('posts/{post}/comments',  [CommentController::class, 'index']);
    Route::post('posts/{post}/comments', [CommentController::class, 'store']);
    Route::delete('comments/{comment}',  [CommentController::class, 'destroy']);

    // Lost & Found
    Route::apiResource('lost-found', LostFoundController::class);
    Route::post('lost-found/{lostFound}/claim', [ClaimController::class, 'store']);

    // Feedback
    Route::post('feedbacks', [FeedbackController::class, 'store']);

    // Notifications
    Route::get('notifications',             [NotificationController::class, 'index']);
    Route::post('notifications/read-all',   [NotificationController::class, 'markAllRead']);
    Route::post('notifications/{id}/read',  [NotificationController::class, 'markRead']);
    Route::delete('notifications/{id}',     [NotificationController::class, 'destroy']);

    // Reports
    Route::post('reports', [ReportController::class, 'store']);

    // Messages — available to ALL authenticated users
    Route::get('messages',              [MessageController::class, 'index']);
    Route::get('messages/{user}',       [MessageController::class, 'show']);
    Route::post('messages/{user}',      [MessageController::class, 'store']);
    Route::delete('messages/{message}', [MessageController::class, 'destroy']);
    // 
    Route::get('groups',                              [GroupController::class, 'index']);
    Route::post('groups',                             [GroupController::class, 'store']);
    Route::get('groups/{group}',                      [GroupController::class, 'show']);
    Route::delete('groups/{group}',                   [GroupController::class, 'destroy']);
    Route::post('groups/{group}/members',             [GroupController::class, 'addMember']);
    Route::delete('groups/{group}/members/{user}',    [GroupController::class, 'removeMember']);
    Route::post('groups/{group}/messages',            [GroupMessageController::class, 'store']);


    // Admin only
    Route::middleware('role:admin')->group(function () {
        Route::get('feedbacks',              [FeedbackController::class, 'index']);
        Route::patch('feedbacks/{feedback}', [FeedbackController::class, 'update']);
        Route::get('claims',                 [ClaimController::class, 'index']);
        Route::patch('claims/{claim}',       [ClaimController::class, 'update']);
        Route::get('reports',                [ReportController::class, 'index']);
        Route::patch('reports/{report}',     [ReportController::class, 'update']);
        
        Route::get('admin/groups',           [AdminController::class, 'groups']);
        Route::get('admin/groups/{group}',   [AdminController::class, 'showGroup']);
        Route::delete('admin/groups/{group}',[AdminController::class, 'destroyGroup']);

        // Users management
        Route::get('admin/users',            [UserController::class, 'index']);
        Route::get('admin/users/{user}',     [UserController::class, 'show']);
        Route::patch('admin/users/{user}',   [UserController::class, 'update']);
        Route::delete('admin/users/{user}',  [UserController::class, 'destroy']);

        // Stats, Logs, Settings
        Route::get('admin/stats',            [AdminController::class, 'stats']);
        Route::get('admin/logs',             [AdminLogController::class, 'index']);
        Route::get('admin/settings',         [AdminSettingsController::class, 'index']);
        Route::patch('admin/settings',       [AdminSettingsController::class, 'update']);
    });
});