<?php

namespace App\Notifications;

use App\Models\Issue;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class IssueStatusChanged extends Notification implements ShouldQueue
{
    use Queueable;

    protected $issue;
    protected $oldStatus;
    protected $newStatus;

    public function __construct(Issue $issue, $oldStatus, $newStatus)
    {
        $this->issue = $issue;
        $this->oldStatus = $oldStatus;
        $this->newStatus = $newStatus;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        $statusLabels = [
            'reported' => 'Reported',
            'verified' => 'Verified',
            'in_progress' => 'In Progress',
            'resolved' => 'Resolved',
            'closed' => 'Closed',
        ];

        return (new MailMessage)
            ->subject('Issue Status Updated: ' . $this->issue->title)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('The status of your reported issue has been updated.')
            ->line('Issue: ' . $this->issue->title)
            ->line('Previous Status: ' . ($statusLabels[$this->oldStatus] ?? $this->oldStatus))
            ->line('New Status: ' . ($statusLabels[$this->newStatus] ?? $this->newStatus))
            ->action('View Issue', url('/api/issues/' . $this->issue->id))
            ->line('Thank you for helping improve our community!');
    }

    public function toArray($notifiable)
    {
        return [
            'issue_id' => $this->issue->id,
            'issue_title' => $this->issue->title,
            'old_status' => $this->oldStatus,
            'new_status' => $this->newStatus,
            'message' => "Your issue '{$this->issue->title}' status changed from {$this->oldStatus} to {$this->newStatus}",
        ];
    }
}
