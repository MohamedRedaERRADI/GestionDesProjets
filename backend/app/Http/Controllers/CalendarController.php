<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class CalendarController extends Controller
{
    /**
     * Get all calendar events for the authenticated user.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $startDate = $request->input('start', Carbon::now()->startOfMonth());
        $endDate = $request->input('end', Carbon::now()->endOfMonth());

        // Récupérer les tâches de l'utilisateur
        $tasks = Task::where('assigned_to', $user->id)
            ->whereBetween('due_date', [$startDate, $endDate])
            ->get()
            ->map(function ($task) {
                return [
                    'id' => 'task_' . $task->id, // Préfixe pour éviter les collisions d'ID
                    'title' => $task->title,
                    'start' => $task->due_date,
                    'end' => $task->due_date,
                    'color' => $this->getTaskColor($task),
                    'type' => 'task',
                    'url' => "/tasks/{$task->id}"
                ];
            });

        // Récupérer les projets de l'utilisateur
        $userProjects = Project::whereHas('members', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
        ->where(function($query) use ($startDate, $endDate) {
            $query->whereBetween('start_date', [$startDate, $endDate])
                  ->orWhereBetween('end_date', [$startDate, $endDate]);
        })
        ->get();

        $projects = $userProjects->map(function ($project) {
            return [
                'id' => 'project_' . $project->id, // Préfixe pour éviter les collisions d'ID
                'title' => $project->title,
                'start' => $project->start_date,
                'end' => $project->end_date,
                'color' => '#4CAF50', // Couleur verte pour les projets
                'type' => 'project',
                'url' => "/projects/{$project->id}"
            ];
        });

        // Merge tasks and projects as plain arrays
        $events = $tasks->concat($projects);

        return response()->json($events);
    }

    /**
     * Get task color based on its status and priority.
     */
    private function getTaskColor($task)
    {
        if ($task->status === 'completed') {
            return '#4CAF50'; // Vert pour les tâches complétées
        }

        if ($task->due_date < now()) {
            return '#F44336'; // Rouge pour les tâches en retard
        }

        switch ($task->priority) {
            case 'high':
                return '#FF9800'; // Orange pour les tâches prioritaires
            case 'medium':
                return '#2196F3'; // Bleu pour les tâches moyennes
            default:
                return '#9E9E9E'; // Gris pour les tâches normales
        }
    }

    /**
     * Get calendar statistics.
     */
    public function stats()
    {
        $user = Auth::user();
        $now = Carbon::now();

        $stats = [
            'tasks' => [
                'total' => Task::where('assigned_to', $user->id)->count(),
                'completed' => Task::where('assigned_to', $user->id)
                    ->where('status', 'completed')
                    ->count(),
                'overdue' => Task::where('assigned_to', $user->id)
                    ->where('status', '!=', 'completed')
                    ->where('due_date', '<', $now)
                    ->count(),
                'upcoming' => Task::where('assigned_to', $user->id)
                    ->where('status', '!=', 'completed')
                    ->where('due_date', '>=', $now)
                    ->count()
            ],
            'projects' => [
                'total' => Project::whereHas('members', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })->count(),
                'active' => Project::whereHas('members', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })->where('status', 'in_progress')->count()
            ]
        ];

        return response()->json($stats);
    }
} 