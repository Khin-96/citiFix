<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Issue;
use App\Models\IssueVote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class IssueVoteController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function vote(Request $request, $issueId)
    {
        $issue = Issue::findOrFail($issueId);
        $user = auth()->user();

        // Check if user already voted
        $existingVote = IssueVote::where('issue_id', $issueId)
            ->where('user_id', $user->id)
            ->first();

        if ($existingVote) {
            return response()->json([
                'message' => 'You have already voted for this issue',
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Create vote
            IssueVote::create([
                'issue_id' => $issueId,
                'user_id' => $user->id,
            ]);

            // Increment votes count
            $issue->increment('votes_count');

            // Award points to the issue reporter (gamification)
            $issue->reporter->increment('points', 5);

            // Auto-verify issue if it reaches threshold (e.g., 3 votes)
            if ($issue->votes_count >= 3 && $issue->status === 'reported') {
                $issue->update(['status' => 'verified']);
            }

            DB::commit();

            $issue->load(['reporter', 'media', 'votes']);

            return response()->json([
                'message' => 'Vote recorded successfully',
                'issue' => $issue,
                'votes_count' => $issue->votes_count,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to record vote',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function unvote(Request $request, $issueId)
    {
        $issue = Issue::findOrFail($issueId);
        $user = auth()->user();

        $vote = IssueVote::where('issue_id', $issueId)
            ->where('user_id', $user->id)
            ->first();

        if (!$vote) {
            return response()->json([
                'message' => 'You have not voted for this issue',
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Delete vote
            $vote->delete();

            // Decrement votes count
            $issue->decrement('votes_count');

            // Remove points from reporter
            $issue->reporter->decrement('points', 5);

            DB::commit();

            $issue->load(['reporter', 'media', 'votes']);

            return response()->json([
                'message' => 'Vote removed successfully',
                'issue' => $issue,
                'votes_count' => $issue->votes_count,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to remove vote',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function voters($issueId)
    {
        $issue = Issue::findOrFail($issueId);
        
        $voters = $issue->votes()
            ->with('user:id,name,email,points')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($voters);
    }

    public function myVotes(Request $request)
    {
        $votes = IssueVote::with(['issue.media', 'issue.reporter'])
            ->where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json($votes);
    }
}
