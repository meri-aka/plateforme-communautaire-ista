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
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Posts
    Route::apiResource('posts', PostController::class);
    Route::post('posts/{post}/like',         [LikeController::class, 'toggle']);
    Route::get('posts/{post}/comments',      [CommentController::class, 'index']);
    Route::post('posts/{post}/comments',     [CommentController::class, 'store']);
    Route::delete('comments/{comment}',      [CommentController::class, 'destroy']);

    // Follow
    Route::post('users/{user}/follow',       [FollowController::class, 'toggle']);

    // Lost & Found
    Route::apiResource('lost-found', LostFoundController::class);
    Route::post('lost-found/{lostFound}/claim', [ClaimController::class, 'store']);

    // Feedback
    Route::post('feedbacks',                 [FeedbackController::class, 'store']);

    // Notifications
    Route::get('notifications',              [NotificationController::class, 'index']);
    Route::post('notifications/{id}/read',   [NotificationController::class, 'markRead']);
    Route::post('notifications/read-all',    [NotificationController::class, 'markAllRead']);

    // Reports
    Route::post('reports',                   [ReportController::class, 'store']);

    // Admin only
    Route::middleware('role:admin')->group(function () {
        Route::get('feedbacks',                  [FeedbackController::class, 'index']);
        Route::patch('feedbacks/{feedback}',     [FeedbackController::class, 'update']);
        Route::get('claims',                     [ClaimController::class, 'index']);
        Route::patch('claims/{claim}',           [ClaimController::class, 'update']);
        Route::get('reports',                    [ReportController::class, 'index']);
        Route::patch('reports/{report}',         [ReportController::class, 'update']);
        // Admin - Users management
        Route::get('admin/users',              [UserController::class, 'index']);
        Route::get('admin/users/{user}',       [UserController::class, 'show']);
        Route::patch('admin/users/{user}',     [UserController::class, 'update']);
        Route::delete('admin/users/{user}',    [UserController::class, 'destroy']);
        // Admin - Stats for dashboard
        Route::get('admin/stats',              [AdminController::class, 'stats']);
        // Admin - Logs
        Route::get('admin/logs',               [AdminLogController::class, 'index']);
        // Admin - Settings
        Route::get('admin/settings',           [AdminSettingsController::class, 'index']);
        Route::patch('admin/settings',         [AdminSettingsController::class, 'update']);

        Route::delete('notifications/{id}', [NotificationController::class, 'destroy']);
    });
});
