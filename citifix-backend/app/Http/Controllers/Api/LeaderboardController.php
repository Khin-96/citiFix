<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class LeaderboardController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index(Request $request)
    {
        $period = $request->input('period', 'all_time'); // all_time, month, week
        $perPage = $request->input('per_page', 20);

        $query = User::with('roles')
            ->withCount('issues')
            ->where('points', '>', 0);

        // Filter by time period
        if ($period === 'month') {
            $query->whereHas('issues', function ($q) {
                $q->where('created_at', '>=', now()->subMonth());
            });
        } elseif ($period === 'week') {
            $query->whereHas('issues', function ($q) {
                $q->where('created_at', '>=', now()->subWeek());
            });
        }

        $leaderboard = $query->orderBy('points', 'desc')
            ->paginate($perPage);

        // Add rank to each user
        $leaderboard->getCollection()->transform(function ($user, $index) use ($leaderboard) {
            $user->rank = ($leaderboard->currentPage() - 1) * $leaderboard->perPage() + $index + 1;
            return $user;
        });

        return response()->json($leaderboard);
    }

    public function myRank()
    {
        $user = auth()->user();
        
        $rank = User::where('points', '>', $user->points)->count() + 1;
        $totalUsers = User::where('points', '>', 0)->count();

        return response()->json([
            'user' => $user,
            'rank' => $rank,
            'total_users' => $totalUsers,
            'points' => $user->points,
            'issues_count' => $user->issues()->count(),
        ]);
    }

    public function stats()
    {
        $totalIssues = \App\Models\Issue::count();
        $resolvedIssues = \App\Models\Issue::where('status', 'resolved')->count();
        $activeUsers = User::whereHas('issues', function ($q) {
            $q->where('created_at', '>=', now()->subMonth());
        })->count();
        $totalVotes = \App\Models\IssueVote::count();

        return response()->json([
            'total_issues' => $totalIssues,
            'resolved_issues' => $resolvedIssues,
            'active_users' => $activeUsers,
            'total_votes' => $totalVotes,
            'resolution_rate' => $totalIssues > 0 ? round(($resolvedIssues / $totalIssues) * 100, 2) : 0,
        ]);
    }
}
