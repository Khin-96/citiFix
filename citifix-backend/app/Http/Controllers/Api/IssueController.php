<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Issue;
use App\Models\IssueMedia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class IssueController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index(Request $request)
    {
        $query = Issue::with(['reporter', 'media', 'assignedOfficer'])
            ->withCount('votes', 'comments');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by category
        if ($reque```php file="app/Http/Controllers/Api/IssueController.php"
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Issue;
use App\Models\IssueMedia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class IssueController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index(Request $request)
    {
        $query = Issue::with(['reporter', 'media', 'assignedOfficer'])
            ->withCount('votes', 'comments');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Filter by location (nearby issues)
        if ($request->has('latitude') && $request->has('longitude')) {
            $radius = $request->input('radius', 5); // Default 5km radius
            $query->nearby($request->latitude, $request->longitude, $radius);
        }

        // Filter by reporter
        if ($request->has('reporter_id')) {
            $query->where('reporter_id', $request->reporter_id);
        }

        // Exclude duplicates by default
        if (!$request->has('include_duplicates')) {
            $query->where('is_duplicate', false);
        }

        // Sort
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        
        if ($sortBy === 'votes') {
            $query->orderBy('votes_count', $sortOrder);
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        $perPage = $request->input('per_page', 15);
        $issues = $query->paginate($perPage);

        return response()->json($issues);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string|in:pothole,broken_light,illegal_dumping,water_leak,pollution,graffiti,road_damage,other',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'address' => 'nullable|string|max:500',
            'media.*' => 'nullable|file|mimes:jpeg,jpg,png,gif,mp4,mov|max:10240', // 10MB max
        ]);

        DB::beginTransaction();
        try {
            // Check for potential duplicates
            $duplicateIssue = Issue::where('category', $validated['category'])
                ->nearby($validated['latitude'], $validated['longitude'], 0.1) // 100m radius
                ->where('status', '!=', 'closed')
                ->first();

            $issue = Issue::create([
                'reporter_id' => auth()->id(),
                'title' => $validated['title'],
                'description' => $validated['description'],
                'category' => $validated['category'],
                'latitude' => $validated['latitude'],
                'longitude' => $validated['longitude'],
                'address' => $validated['address'] ?? null,
                'status' => 'reported',
                'parent_issue_id' => $duplicateIssue ? $duplicateIssue->id : null,
                'is_duplicate' => $duplicateIssue ? true : false,
            ]);

            // Handle media uploads
            if ($request->hasFile('media')) {
                foreach ($request->file('media') as $file) {
                    $path = $file->store('issues/' . $issue->id, 'public');
                    $type = str_starts_with($file->getMimeType(), 'video') ? 'video' : 'photo';

                    IssueMedia::create([
                        'issue_id' => $issue->id,
                        'file_path' => $path,
                        'file_name' => $file->getClientOriginalName(),
                        'mime_type' => $file->getMimeType(),
                        'file_size' => $file->getSize(),
                        'type' => $type,
                    ]);
                }
            }

            DB::commit();

            $issue->load(['reporter', 'media', 'votes', 'comments']);

            return response()->json([
                'message' => $duplicateIssue 
                    ? 'Issue reported and marked as potential duplicate' 
                    : 'Issue reported successfully',
                'issue' => $issue,
                'is_duplicate' => $duplicateIssue ? true : false,
                'parent_issue' => $duplicateIssue,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create issue',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show($id)
    {
        $issue = Issue::with([
            'reporter',
            'media',
            'assignedOfficer',
            'votes.user',
            'comments.user',
            'comments.media',
            'parentIssue',
            'duplicates'
        ])
        ->withCount('votes', 'comments')
        ->findOrFail($id);

        return response()->json($issue);
    }

    public function update(Request $request, $id)
    {
        $issue = Issue::findOrFail($id);

        // Check permissions
        $user = auth()->user();
        if (!$user->hasRole(['officer', 'admin']) && $issue->reporter_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized to update this issue',
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'category' => 'sometimes|string|in:pothole,broken_light,illegal_dumping,water_leak,pollution,graffiti,road_damage,other',
            'status' => 'sometimes|string|in:reported,verified,in_progress,resolved,closed',
            'assigned_to' => 'sometimes|nullable|exists:users,id',
            'address' => 'sometimes|nullable|string|max:500',
        ]);

        // Only officers/admins can change status and assignment
        if (isset($validated['status']) || isset($validated['assigned_to'])) {
            if (!$user->hasRole(['officer', 'admin'])) {
                return response()->json([
                    'message' => 'Only officers and admins can change status or assignment',
                ], 403);
            }
        }

        $issue->update($validated);
        $issue->load(['reporter', 'media', 'assignedOfficer']);

        return response()->json([
            'message' => 'Issue updated successfully',
            'issue' => $issue,
        ]);
    }

    public function destroy($id)
    {
        $issue = Issue::findOrFail($id);

        // Only admin or the reporter can delete
        $user = auth()->user();
        if (!$user->hasRole('admin') && $issue->reporter_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized to delete this issue',
            ], 403);
        }

        // Delete associated media files
        foreach ($issue->media as $media) {
            Storage::disk('public')->delete($media->file_path);
        }

        $issue->delete();

        return response()->json([
            'message' => 'Issue deleted successfully',
        ]);
    }

    public function myIssues(Request $request)
    {
        $issues = Issue::with(['media', 'assignedOfficer'])
            ->withCount('votes', 'comments')
            ->where('reporter_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json($issues);
    }

    public function categories()
    {
        $categories = [
            ['value' => 'pothole', 'label' => 'Pothole'],
            ['value' => 'broken_light', 'label' => 'Broken Street Light'],
            ['value' => 'illegal_dumping', 'label' => 'Illegal Dumping'],
            ['value' => 'water_leak', 'label' => 'Water Leak'],
            ['value' => 'pollution', 'label' => 'Pollution'],
            ['value' => 'graffiti', 'label' => 'Graffiti'],
            ['value' => 'road_damage', 'label' => 'Road Damage'],
            ['value' => 'other', 'label' => 'Other'],
        ];

        return response()->json($categories);
    }

    public function heatmap(Request $request)
    {
        $request->validate([
            'min_latitude' => 'required|numeric',
            'max_latitude' => 'required|numeric',
            'min_longitude' => 'required|numeric',
            'max_longitude' => 'required|numeric',
        ]);

        $issues = Issue::select('id', 'latitude', 'longitude', 'category', 'status', 'votes_count')
            ->whereBetween('latitude', [$request->min_latitude, $request->max_latitude])
            ->whereBetween('longitude', [$request->min_longitude, $request->max_longitude])
            ->where('is_duplicate', false)
            ->get();

        return response()->json([
            'issues' => $issues,
            'count' => $issues->count(),
        ]);
    }
}
