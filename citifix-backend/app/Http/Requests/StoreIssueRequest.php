<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreIssueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'required|string|min:10',
            'category' => 'required|string|in:pothole,broken_light,illegal_dumping,water_leak,pollution,graffiti,road_damage,other',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'address' => 'nullable|string|max:500',
            'media' => 'nullable|array|max:5',
            'media.*' => 'file|mimes:jpeg,jpg,png,gif,mp4,mov,avi|max:10240',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Please provide a title for the issue',
            'description.required' => 'Please describe the issue',
            'description.min' => 'Description must be at least 10 characters',
            'category.required' => 'Please select a category',
            'category.in' => 'Invalid category selected',
            'latitude.required' => 'Location is required',
            'longitude.required' => 'Location is required',
            'media.*.mimes' => 'Only images (jpeg, jpg, png, gif) and videos (mp4, mov, avi) are allowed',
            'media.*.max' => 'Each file must not exceed 10MB',
        ];
    }
}
