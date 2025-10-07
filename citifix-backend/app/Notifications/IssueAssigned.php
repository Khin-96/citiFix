<?php

namespace App\Notifications;

use App\Models\Issue;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class IssueAssigned extends Notification implements ShouldQueue
{
    use Queueable;

    protected $issue;

    public function __construct(Issue $issue)
    {
        $this->issue = $issue;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('New Issue Assigned to You')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('A new issue has been assigned to you.')
            ->line('Issue: ' . $this->issue->title)
            ->line('Category: ' . $this->issue->category)
            ->line('Location: ' . ($this->issue->address ?? 'Lat: ' . $this->issue->latitude . ', Lng: ' . $this->issue->longitude))
            ->action('View Issue', url('/api/issues/' . $this->issue->id))
            ->line('Please review and take appropriate action.');
    }

    public function toArray($notifiable)
    {
        return [
            'issue_id' => $this->issue->id,
            'issue_title' => $this->issue->title,
            'category' => $this->issue->category,
            'message' => "Issue '{$this->issue->title}' has been assigned to you",
        ];
    }
}
