<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Issue;
use App\Models\IssueComment;
use App\Models\CommentMedia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class IssueCommentController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index($issueId)
    {
        $issue = Issue::findOrFail($issueId);

        $comments = IssueComment::with(['user', 'media'])
            ->where('issue_id', $issueId)
            ->orderBy('created_at', 'asc')
            ->paginate(20);

        return response()->json($comments);
    }

    public function store(Request $request, $issueId)
    {
        $issue = Issue::findOrFail($issueId);

        $validated = $request->validate([
            'comment' => 'required|string|min:1|max:1000',
            'media.*' => 'nullable|file|mimes:jpeg,jpg,png,gif,mp4,mov|max:10240',
        ]);

        DB::beginTransaction();
        try {
            $comment = IssueComment::create([
                'issue_id' => $issueId,
                'user_id' => auth()->id(),
                'comment' => $validated['comment'],
            ]);

            // Handle media uploads
            if ($request->hasFile('media')) {
                foreach ($request->file('media') as $file) {
                    $path = $file->store('comments/' . $comment->id, 'public');
                    $type = str_starts_with($file->getMimeType(), 'video') ? 'video' : 'photo';

                    CommentMedia::create([
                        'comment_id' => $comment->id,
                        'file_path' => $path,
                        'file_name' => $file->getClientOriginalName(),
                        'mime_type' => $file->getMimeType(),
                        'file_size' => $file->getSize(),
                        'type' => $type,
                    ]);
                }
            }

            // Award points for commenting
            auth()->user()->increment('points', 2);

            DB::commit();

            $comment->load(['user', 'media']);

            return response()->json([
                'message' => 'Comment added successfully',
                'comment' => $comment,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to add comment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $issueId, $commentId)
    {
        $comment = IssueComment::where('issue_id', $issueId)
            ->findOrFail($commentId);

        // Only the comment author can update
        if ($comment->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized to update this comment',
            ], 403);
        }

        $validated = $request->validate([
            'comment' => 'required|string|min:1|max:1000',
        ]);

        $comment->update($validated);
        $comment->load(['user', 'media']);

        return response()->json([
            'message' => 'Comment updated successfully',
            'comment' => $comment,
        ]);
    }

    public function destroy($issueId, $commentId)
    {
        $comment = IssueComment::where('issue_id', $issueId)
            ->findOrFail($commentId);

        $user = auth()->user();

        // Only the comment author or admin can delete
        if ($comment->user_id !== $user->id && !$user->hasRole('admin')) {
            return response()->json([
                'message' => 'Unauthorized to delete this comment',
            ], 403);
        }

        // Delete associated media files
        foreach ($comment->media as $media) {
            Storage::disk('public')->delete($media->file_path);
        }

        $comment->delete();

        // Deduct points
        if ($comment->user_id === $user->id) {
            $user->decrement('points', 2);
        }

        return response()->json([
            'message' => 'Comment deleted successfully',
        ]);
    }

    public function myComments(Request $request)
    {
        $comments = IssueComment::with(['issue.media', 'media'])
            ->where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json($comments);
    }
}
