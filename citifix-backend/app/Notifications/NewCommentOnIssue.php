<?php

namespace App\Notifications;

use App\Models\Issue;
use App\Models\IssueComment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewCommentOnIssue extends Notification implements ShouldQueue
{
    use Queueable;

    protected $issue;
    protected $comment;

    public function __construct(Issue $issue, IssueComment $comment)
    {
        $this->issue = $issue;
        $this->comment = $comment;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('New Comment on Your Issue: ' . $this->issue->title)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Someone commented on your reported issue.')
            ->line('Issue: ' . $this->issue->title)
            ->line('Comment by: ' . $this->comment->user->name)
            ->line('Comment: ' . substr($this->comment->comment, 0, 100) . (strlen($this->comment->comment) > 100 ? '...' : ''))
            ->action('View Issue', url('/api/issues/' . $this->issue->id))
            ->line('Thank you for using our platform!');
    }

    public function toArray($notifiable)
    {
        return [
            'issue_id' => $this->issue->id,
            'issue_title' => $this->issue->title,
            'comment_id' => $this->comment->id,
            'commenter_name' => $this->comment->user->name,
            'comment_preview' => substr($this->comment->comment, 0, 100),
            'message' => "{$this->comment->user->name} commented on your issue '{$this->issue->title}'",
        ];
    }
}
