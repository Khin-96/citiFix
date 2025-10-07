<?php

namespace App\Observers;

use App\Models\Issue;
use App\Notifications\IssueStatusChanged;
use App\Notifications\IssueAssigned;

class IssueObserver
{
    public function created(Issue $issue)
    {
        // Award points to reporter for creating an issue
        $issue->reporter->increment('points', 10);
    }

    public function updated(Issue $issue)
    {
        // Notify reporter when status changes
        if ($issue->isDirty('status')) {
            $oldStatus = $issue->getOriginal('status');
            $newStatus = $issue->status;
            
            $issue->reporter->notify(new IssueStatusChanged($issue, $oldStatus, $newStatus));

            // Award bonus points when issue is verified
            if ($newStatus === 'verified') {
                $issue->reporter->increment('points', 15);
            }

            // Award bonus points when issue is resolved
            if ($newStatus === 'resolved') {
                $issue->reporter->increment('points', 25);
            }
        }

        // Notify officer when issue is assigned
        if ($issue->isDirty('assigned_to') && $issue->assigned_to) {
            $officer = $issue->assignedOfficer;
            if ($officer) {
                $officer->notify(new IssueAssigned($issue));
            }
        }
    }

    public function deleted(Issue $issue)
    {
        // Deduct points when issue is deleted
        $issue->reporter->decrement('points', 10);
    }
}
