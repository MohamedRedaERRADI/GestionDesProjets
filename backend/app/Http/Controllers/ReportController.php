<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use PDF;

class ReportController extends Controller
{
    /**
     * Generate a project progress report.
     */
    public function projectProgress(Request $request, Project $project)
    {
        $this->authorize('view', $project);

        $tasks = $project->tasks()
            ->with(['assignedTo', 'createdBy'])
            ->get();

        $stats = [
            'total_tasks' => $tasks->count(),
            'completed_tasks' => $tasks->where('status', 'completed')->count(),
            'in_progress_tasks' => $tasks->where('status', 'in_progress')->count(),
            'pending_tasks' => $tasks->where('status', 'pending')->count(),
            'overdue_tasks' => $tasks->where('status', '!=', 'completed')
                ->where('due_date', '<', now())
                ->count()
        ];

        if ($request->has('download')) {
            $pdf = PDF::loadView('reports.project-progress', [
                'project' => $project,
                'tasks' => $tasks,
                'stats' => $stats
            ]);

            return $pdf->download("project-progress-{$project->id}.pdf");
        }

        return response()->json([
            'project' => $project,
            'tasks' => $tasks,
            'stats' => $stats
        ]);
    }

    /**
     * Generate a user performance report.
     */
    public function userPerformance(Request $request, User $user)
    {
        $this->authorize('view-performance', $user);

        $startDate = $request->input('start_date', Carbon::now()->subMonth());
        $endDate = $request->input('end_date', Carbon::now());

        $tasks = Task::where('assigned_to', $user->id)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get();

        $stats = [
            'total_tasks' => $tasks->count(),
            'completed_tasks' => $tasks->where('status', 'completed')->count(),
            'on_time_tasks' => $tasks->where('status', 'completed')
                ->where('completed_at', '<=', 'due_date')
                ->count(),
            'overdue_tasks' => $tasks->where('status', 'completed')
                ->where('completed_at', '>', 'due_date')
                ->count(),
            'completion_rate' => $tasks->count() > 0 
                ? round(($tasks->where('status', 'completed')->count() / $tasks->count()) * 100, 2)
                : 0
        ];

        if ($request->has('download')) {
            $pdf = PDF::loadView('reports.user-performance', [
                'user' => $user,
                'tasks' => $tasks,
                'stats' => $stats,
                'period' => [
                    'start' => $startDate,
                    'end' => $endDate
                ]
            ]);

            return $pdf->download("user-performance-{$user->id}.pdf");
        }

        return response()->json([
            'user' => $user,
            'tasks' => $tasks,
            'stats' => $stats,
            'period' => [
                'start' => $startDate,
                'end' => $endDate
            ]
        ]);
    }

    /**
     * Generate a team performance report.
     */
    public function teamPerformance(Request $request, Project $project)
    {
        $this->authorize('view-team-performance', $project);

        $startDate = $request->input('start_date', Carbon::now()->subMonth());
        $endDate = $request->input('end_date', Carbon::now());

        $teamMembers = $project->members()
            ->with(['tasks' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate]);
            }])
            ->get();

        $teamStats = [
            'total_members' => $teamMembers->count(),
            'total_tasks' => $teamMembers->sum(function ($member) {
                return $member->tasks->count();
            }),
            'completed_tasks' => $teamMembers->sum(function ($member) {
                return $member->tasks->where('status', 'completed')->count();
            }),
            'average_completion_rate' => $teamMembers->avg(function ($member) {
                $totalTasks = $member->tasks->count();
                return $totalTasks > 0 
                    ? ($member->tasks->where('status', 'completed')->count() / $totalTasks) * 100
                    : 0;
            })
        ];

        if ($request->has('download')) {
            $pdf = PDF::loadView('reports.team-performance', [
                'project' => $project,
                'teamMembers' => $teamMembers,
                'stats' => $teamStats,
                'period' => [
                    'start' => $startDate,
                    'end' => $endDate
                ]
            ]);

            return $pdf->download("team-performance-{$project->id}.pdf");
        }

        return response()->json([
            'project' => $project,
            'teamMembers' => $teamMembers,
            'stats' => $teamStats,
            'period' => [
                'start' => $startDate,
                'end' => $endDate
            ]
        ]);
    }
} 