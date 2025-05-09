<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function index()
    {
        try {
            $user = Auth::user();
            $projects = Project::whereHas('members', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })->get();

            $generalStats = [
                'total_projects' => $projects->count(),
                'completed_projects' => $projects->where('status', 'completed')->count(),
                'in_progress_projects' => $projects->where('status', 'in_progress')->count(),
                'pending_projects' => $projects->where('status', 'pending')->count()
            ];

            return response()->json($generalStats);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function projectProgress(Project $project)
    {
        try {
            // Vérifier les permissions
            if (!$project->members()->where('user_id', Auth::id())->exists()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $tasks = $project->tasks;
            $totalTasks = $tasks->count();
            $completedTasks = $tasks->where('status', 'completed')->count();
            $inProgressTasks = $tasks->where('status', 'in_progress')->count();
            $pendingTasks = $tasks->where('status', 'pending')->count();

            $progress = [
                'project_name' => $project->title,
                'total_tasks' => $totalTasks,
                'completed_tasks' => $completedTasks,
                'in_progress_tasks' => $inProgressTasks,
                'pending_tasks' => $pendingTasks,
                'completion_rate' => $totalTasks > 0 ? ($completedTasks / $totalTasks) * 100 : 0,
                'start_date' => $project->start_date,
                'end_date' => $project->end_date,
                'status' => $project->status
            ];

            return response()->json($progress);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function userPerformance(User $user)
    {
        try {
            // Vérifier les permissions (seul l'utilisateur lui-même ou un admin peut voir ses performances)
            if (Auth::id() !== $user->id && !Auth::user()->isAdmin()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $assignedTasks = Task::where('assignee_id', $user->id)->get();
            $completedTasks = $assignedTasks->where('status', 'completed');
            
            $performance = [
                'user_name' => $user->name,
                'total_tasks' => $assignedTasks->count(),
                'completed_tasks' => $completedTasks->count(),
                'completion_rate' => $assignedTasks->count() > 0 
                    ? ($completedTasks->count() / $assignedTasks->count()) * 100 
                    : 0,
                'on_time_completion' => $completedTasks
                    ->filter(function($task) {
                        return $task->completed_at <= $task->due_date;
                    })->count(),
                'projects_involved' => $user->projects()->count()
            ];

            return response()->json($performance);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function teamPerformance(Project $project)
    {
        try {
            // Vérifier les permissions
            if (!$project->members()->where('user_id', Auth::id())->exists()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $teamMembers = $project->members;
            $teamPerformance = [];

            foreach ($teamMembers as $member) {
                $memberTasks = $project->tasks()->where('assignee_id', $member->id)->get();
                $completedTasks = $memberTasks->where('status', 'completed');

                $teamPerformance[] = [
                    'member_name' => $member->name,
                    'member_role' => $member->pivot->role,
                    'total_tasks' => $memberTasks->count(),
                    'completed_tasks' => $completedTasks->count(),
                    'completion_rate' => $memberTasks->count() > 0 
                        ? ($completedTasks->count() / $memberTasks->count()) * 100 
                        : 0,
                    'on_time_completion' => $completedTasks
                        ->filter(function($task) {
                            return $task->completed_at <= $task->due_date;
                        })->count()
                ];
            }

            return response()->json([
                'project_name' => $project->title,
                'team_size' => $teamMembers->count(),
                'team_performance' => $teamPerformance
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}