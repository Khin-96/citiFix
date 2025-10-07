<?php

namespace App\Observers;

use App\Models\IssueComment;
use App\Notifications\NewCommentOnIssue;

class IssueCommentObserver
{
    public function created(IssueComment $comment)
    {
        $issue = $comment->issue;
        
        // Notify the issue reporter if someone else comments
        if ($issue->reporter_id !== $comment->user_id) {
            $issue->reporter->notify(new NewCommentOnIssue($issue, $comment));
        }

        // Notify assigned officer if someone comments
        if ($issue->assigned_to && $issue->assigned_to !== $comment->user_id) {
            $issue->assignedOfficer->notify(new NewCommentOnIssue($issue, $comment));
        }
    }
}
