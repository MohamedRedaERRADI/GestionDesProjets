<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;

class DashboardController extends Controller
{
    public function getStats()
    {
        $stats = [
            'totalProjects' => Project::count(),
            'totalTasks' => Task::count(),
            'completedTasks' => Task::where('status', 'completed')->count(),
            'teamMembers' => User::count(),
        ];

        return response()->json($stats);
    }

    public function getRecentProjects()
    {
        $recentProjects = Project::with(['tasks'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($project) {
                $totalTasks = $project->tasks->count();
                $completedTasks = $project->tasks->where('status', 'completed')->count();
                
                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'description' => $project->description,
                    'status' => $project->status,
                    'due_date' => $project->due_date,
                    'totalTasks' => $totalTasks,
                    'completedTasks' => $completedTasks,
                ];
            });

        return response()->json($recentProjects);
    }

    public function getUpcomingTasks()
    {
        $upcomingTasks = Task::with('project')
            ->where('status', '!=', 'completed')
            ->orderBy('due_date')
            ->take(5)
            ->get()
            ->map(function ($task) {
                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'description' => $task->description,
                    'priority' => $task->priority,
                    'due_date' => $task->due_date,
                    'project_name' => $task->project->name,
                ];
            });

        return response()->json($upcomingTasks);
    }
} 