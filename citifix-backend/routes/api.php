<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\IssueController;
use App\Http\Controllers\Api\IssueVoteController;
use App\Http\Controllers\Api\IssueCommentController;
use App\Http\Controllers\Api\LeaderboardController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\NotificationController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);

    // Issue routes
    Route::get('/issues', [IssueController::class, 'index']);
    Route::post('/issues', [IssueController::class, 'store']);
    Route::get('/issues/categories', [IssueController::class, 'categories']);
    Route::get('/issues/my-issues', [IssueController::class, 'myIssues']);
    Route::get('/issues/heatmap', [IssueController::class, 'heatmap']);
    Route::get('/issues/{id}', [IssueController::class, 'show']);
    Route::patch('/issues/{id}', [IssueController::class, 'update']);
    Route::delete('/issues/{id}', [IssueController::class, 'destroy']);

    // Vote routes
    Route::post('/issues/{id}/vote', [IssueVoteController::class, 'vote']);
    Route::delete('/issues/{id}/vote', [IssueVoteController::class, 'unvote']);
    Route::get('/issues/{id}/voters', [IssueVoteController::class, 'voters']);
    Route::get('/votes/my-votes', [IssueVoteController::class, 'myVotes']);

    // Comment routes
    Route::get('/issues/{id}/comments', [IssueCommentController::class, 'index']);
    Route::post('/issues/{id}/comments', [IssueCommentController::class, 'store']);
    Route::patch('/issues/{issueId}/comments/{commentId}', [IssueCommentController::class, 'update']);
    Route::delete('/issues/{issueId}/comments/{commentId}', [IssueCommentController::class, 'destroy']);
    Route::get('/comments/my-comments', [IssueCommentController::class, 'myComments']);

    // Leaderboard routes
    Route::get('/leaderboard', [LeaderboardController::class, 'index']);
    Route::get('/leaderboard/my-rank', [LeaderboardController::class, 'myRank']);
    Route::get('/leaderboard/stats', [LeaderboardController::class, 'stats']);

    // Notification routes
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread', [NotificationController::class, 'unread']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    Route::delete('/notifications', [NotificationController::class, 'destroyAll']);

    // Dashboard routes (Officer/Admin only)
    Route::prefix('dashboard')->group(function () {
        Route::get('/stats', [DashboardController::class, 'stats']);
        Route::get('/issues-trend', [DashboardController::class, 'issuesTrend']);
        Route::get('/category-breakdown', [DashboardController::class, 'categoryBreakdown']);
        Route::get('/top-reporters', [DashboardController::class, 'topReporters']);
        Route::get('/location-hotspots', [DashboardController::class, 'locationHotspots']);
        Route::get('/officer-performance', [DashboardController::class, 'officerPerformance']);
        Route::get('/recent-activity', [DashboardController::class, 'recentActivity']);
        Route::post('/export', [DashboardController::class, 'exportData']);
    });
});