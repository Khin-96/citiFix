<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Issue;
use App\Models\User;
use App\Models\IssueVote;
use App\Models\IssueComment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'role:officer|admin']);
    }

    public function stats(Request $request)
    {
        $period = $request->input('period', '30'); // days

        $startDate = now()->subDays($period);

        // Overall statistics
        $totalIssues = Issue::count();
        $openIssues = Issue::whereIn('status', ['reported', 'verified', 'in_progress'])->count();
        $resolvedIssues = Issue::where('status', 'resolved')->count();
        $closedIssues = Issue::where('status', 'closed')->count();

        // Period-specific statistics
        $newIssues = Issue::where('created_at', '>=', $startDate)->count();
        $resolvedInPeriod = Issue::where('status', 'resolved')
            ->where('updated_at', '>=', $startDate)
            ->count();

        // Average resolution time (in days)
        $avgResolutionTime = Issue::where('status', 'resolved')
            ->selectRaw('AVG(DATEDIFF(updated_at, created_at)) as avg_days')
            ->value('avg_days');

        // Issues by status
        $issuesByStatus = Issue::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        // Issues by category
        $issuesByCategory = Issue::select('category', DB::raw('count(*) as count'))
            ->groupBy('category')
            ->orderBy('count', 'desc')
            ->get();

        // Active users
        $activeUsers = User::whereHas('issues', function ($q) use ($startDate) {
            $q->where('created_at', '>=', $startDate);
        })->count();

        // Total votes and comments
        $totalVotes = IssueVote::count();
        $totalComments = IssueComment::count();

        return response()->json([
            'overview' => [
                'total_issues' => $totalIssues,
                'open_issues' => $openIssues,
                'resolved_issues' => $resolvedIssues,
                'closed_issues' => $closedIssues,
                'resolution_rate' => $totalIssues > 0 ? round(($resolvedIssues / $totalIssues) * 100, 2) : 0,
            ],
            'period_stats' => [
                'period_days' => $period,
                'new_issues' => $newIssues,
                'resolved_in_period' => $resolvedInPeriod,
                'active_users' => $activeUsers,
            ],
            'performance' => [
                'avg_resolution_time_days' => round($avgResolutionTime ?? 0, 2),
                'total_votes' => $totalVotes,
                'total_comments' => $totalComments,
            ],
            'breakdown' => [
                'by_status' => $issuesByStatus,
                'by_category' => $issuesByCategory,
            ],
        ]);
    }

    public function issuesTrend(Request $request)
    {
        $days = $request->input('days', 30);
        $startDate = now()->subDays($days);

        $trend = Issue::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('count(*) as count')
            )
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        return response()->json([
            'period' => $days,
            'trend' => $trend,
        ]);
    }

    public function categoryBreakdown(Request $request)
    {
        $period = $request->input('period', '30');
        $startDate = now()->subDays($period);

        $breakdown = Issue::select(
                'category',
                DB::raw('count(*) as total'),
                DB::raw('SUM(CASE WHEN status = "resolved" THEN 1 ELSE 0 END) as resolved'),
                DB::raw('SUM(CASE WHEN status IN ("reported", "verified", "in_progress") THEN 1 ELSE 0 END) as open')
            )
            ->where('created_at', '>=', $startDate)
            ->groupBy('category')
            ->orderBy('total', 'desc')
            ->get()
            ->map(function ($item) {
                $item->resolution_rate = $item->total > 0 
                    ? round(($item->resolved / $item->total) * 100, 2) 
                    : 0;
                return $item;
            });

        return response()->json($breakdown);
    }

    public function topReporters(Request $request)
    {
        $period = $request->input('period', '30');
        $limit = $request->input('limit', 10);
        $startDate = now()->subDays($period);

        $topReporters = User::select('users.id', 'users.name', 'users.email', 'users.points')
            ->withCount(['issues' => function ($q) use ($startDate) {
                $q->where('created_at', '>=', $startDate);
            }])
            ->having('issues_count', '>', 0)
            ->orderBy('issues_count', 'desc')
            ->limit($limit)
            ->get();

        return response()->json($topReporters);
    }

    public function locationHotspots(Request $request)
    {
        $period = $request->input('period', '30');
        $startDate = now()->subDays($period);

        // Get issues grouped by approximate location (rounded to 3 decimal places)
        $hotspots = Issue::select(
                DB::raw('ROUND(latitude, 3) as lat'),
                DB::raw('ROUND(longitude, 3) as lng'),
                DB::raw('count(*) as issue_count'),
                'category'
            )
            ->where('created_at', '>=', $startDate)
            ->where('is_duplicate', false)
            ->groupBy('lat', 'lng', 'category')
            ->having('issue_count', '>', 1)
            ->orderBy('issue_count', 'desc')
            ->limit(50)
            ->get();

        return response()->json($hotspots);
    }

    public function officerPerformance(Request $request)
    {
        $period = $request->input('period', '30');
        $startDate = now()->subDays($period);

        $performance = User::role('officer')
            ->select('users.id', 'users.name', 'users.email')
            ->withCount([
                'issues as assigned_issues' => function ($q) {
                    $q->whereColumn('issues.assigned_to', 'users.id');
                },
                'issues as resolved_issues' => function ($q) use ($startDate) {
                    $q->whereColumn('issues.assigned_to', 'users.id')
                      ->where('status', 'resolved')
                      ->where('updated_at', '>=', $startDate);
                }
            ])
            ->get()
            ->map(function ($officer) {
                $officer->resolution_rate = $officer->assigned_issues > 0
                    ? round(($officer->resolved_issues / $officer->assigned_issues) * 100, 2)
                    : 0;
                return $officer;
            });

        return response()->json($performance);
    }

    public function recentActivity(Request $request)
    {
        $limit = $request->input('limit', 20);

        $recentIssues = Issue::with(['reporter', 'media'])
            ->withCount('votes', 'comments')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        $recentComments = IssueComment::with(['user', 'issue'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            'recent_issues' => $recentIssues,
            'recent_comments' => $recentComments,
        ]);
    }

    public function exportData(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'format' => 'sometimes|in:json,csv',
        ]);

        $issues = Issue::with(['reporter', 'media', 'assignedOfficer', 'votes', 'comments'])
            ->whereBetween('created_at', [$request->start_date, $request->end_date])
            ->get();

        $format = $request->input('format', 'json');

        if ($format === 'csv') {
            $csvData = $this->convertToCsv($issues);
            
            return response($csvData)
                ->header('Content-Type', 'text/csv')
                ->header('Content-Disposition', 'attachment; filename="issues_export.csv"');
        }

        return response()->json([
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'total_issues' => $issues->count(),
            'issues' => $issues,
        ]);
    }

    private function convertToCsv($issues)
    {
        $csv = "ID,Title,Category,Status,Reporter,Latitude,Longitude,Votes,Comments,Created At,Updated At\n";
        
        foreach ($issues as $issue) {
            $csv .= sprintf(
                "%d,\"%s\",\"%s\",\"%s\",\"%s\",%s,%s,%d,%d,\"%s\",\"%s\"\n",
                $issue->id,
                str_replace('"', '""', $issue->title),
                $issue->category,
                $issue->status,
                $issue->reporter->name,
                $issue->latitude,
                $issue->longitude,
                $issue->votes->count(),
                $issue->comments->count(),
                $issue->created_at,
                $issue->updated_at
            );
        }

        return $csv;
    }
}
