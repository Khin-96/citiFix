<?php

namespace App\Providers;

use App\Models\Issue;
use App\Models\IssueComment;
use App\Observers\IssueObserver;
use App\Observers\IssueCommentObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Issue::observe(IssueObserver::class);
        IssueComment::observe(IssueCommentObserver::class);
    }
}
