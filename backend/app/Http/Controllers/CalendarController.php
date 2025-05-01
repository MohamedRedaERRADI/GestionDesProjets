<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class CalendarController extends Controller
{
    /**
     * Get all calendar events for the authenticated user.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $startDate = $request->input('start', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end', Carbon::now()->endOfMonth()->format('Y-m-d'));

        Log::info('Calendar request', [
            'user_id' => $user->id,
            'start_date' => $startDate,
            'end_date' => $endDate
        ]);

        // Récupérer les tâches de l'utilisateur
        $tasks = Task::where('assigned_to', $user->id)
            ->whereBetween('due_date', [$startDate, $endDate])
            ->get()
            ->map(function ($task) {
                return [
                    'id' => 'task_' . $task->id, // Préfixe pour éviter les collisions d'ID
                    'title' => $task->title,
                    'start' => $task->due_date->format('Y-m-d'),
                    'end' => $task->due_date->format('Y-m-d'),
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
            // Inclusion des projets qui ont des dates qui chevauchent la période
            $query->where(function ($q) use ($startDate, $endDate) {
                // Projets qui commencent pendant le mois
                $q->whereBetween('start_date', [$startDate, $endDate])
                // OU projets qui finissent pendant le mois
                ->orWhereBetween('end_date', [$startDate, $endDate])
                // OU projets qui englobent tout le mois
                ->orWhere(function ($q2) use ($startDate, $endDate) {
                    $q2->where('start_date', '<=', $startDate)
                        ->where('end_date', '>=', $endDate);
                });
            });
        })
        ->get();

        Log::info('Projects found', [
            'count' => $userProjects->count(),
            'projects' => $userProjects->map(function ($p) {
                return [
                    'id' => $p->id,
                    'title' => $p->title,
                    'start_date' => $p->start_date,
                    'end_date' => $p->end_date
                ];
            })
        ]);

        $projects = $userProjects->map(function ($project) {
            return [
                'id' => 'project_' . $project->id, // Préfixe pour éviter les collisions d'ID
                'title' => $project->title,
                'start' => $project->start_date->format('Y-m-d'),
                'end' => $project->end_date->format('Y-m-d'),
                'color' => '#4CAF50', // Couleur verte pour les projets
                'type' => 'project',
                'url' => "/projects/{$project->id}"
            ];
        });

        // Merge tasks and projects as plain arrays
        $events = $tasks->concat($projects);

        Log::info('Calendar events response', [
            'count' => $events->count(),
            'data' => $events
        ]);

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