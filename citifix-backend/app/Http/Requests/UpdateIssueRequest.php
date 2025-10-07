<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateIssueRequest extends FormRequest
{
    public function authorize(): bool
    {
        $issue = $this->route('issue');
        $user = $this->user();

        // Allow if user is officer/admin or the reporter
        return $user->hasRole(['officer', 'admin']) || $issue->reporter_id === $user->id;
    }

    public function rules(): array
    {
        $user = $this->user();
        $rules = [];

        // Citizens can only update title and description
        if (!$user->hasRole(['officer', 'admin'])) {
            $rules = [
                'title' => 'sometimes|string|max:255',
                'description' => 'sometimes|string|min:10',
            ];
        } else {
            // Officers and admins can update everything
            $rules = [
                'title' => 'sometimes|string|max:255',
                'description' => 'sometimes|string|min:10',
                'category' => 'sometimes|string|in:pothole,broken_light,illegal_dumping,water_leak,pollution,graffiti,road_damage,other',
                'status' => 'sometimes|string|in:reported,verified,in_progress,resolved,closed',
                'assigned_to' => 'sometimes|nullable|exists:users,id',
                'address' => 'sometimes|nullable|string|max:500',
            ];
        }

        return $rules;
    }
}
