<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class AIAssistantController extends Controller
{
    // Traitement de l'intention de l'utilisateur
    public function handle(Request $request)
    {
        try {
            $user = Auth::user();
            $message = $request->input('message');
            $context = $request->input('context', []);

            // Récupérer le contexte de l'utilisateur
            $userContext = $this->getUserContext($user, $context);

            // Analyser l'intention de l'utilisateur
            $intent = $this->analyzeIntent($message);

            // Générer la réponse appropriée
            $response = $this->generateResponse($intent, $userContext, $message);

            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Erreur dans AIAssistantController: ' . $e->getMessage());
            return response()->json([
                'message' => 'Désolé, je rencontre des difficultés techniques. Veuillez réessayer plus tard.',
                'suggestions' => [],
                'actions' => [],
            ], 500);
        }
    }

    private function getUserContext($user, $context)
    {
        // Récupérer les projets de l'utilisateur
        $projects = Project::whereHas('members', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->get();

        // Récupérer les tâches de l'utilisateur
        $tasks = Task::where('assigned_to', $user->id)
            ->orWhere('created_by', $user->id)
            ->get();

        return [
            'user' => $user,
            'projects' => $projects,
            'tasks' => $tasks,
            'current_project' => $context['currentProject'] ?? null,
            'recent_tasks' => $context['recentTasks'] ?? [],
        ];
    }

    private function analyzeIntent($message)
    {
        $message = strtolower($message);

        // Analyse simple basée sur des mots-clés
        if (str_contains($message, ['tâche', 'todo', 'à faire'])) {
            return 'tasks';
        } elseif (str_contains($message, ['projet', 'projets'])) {
            return 'projects';
        } elseif (str_contains($message, ['aide', 'comment', 'aide-moi'])) {
            return 'help';
        } elseif (str_contains($message, ['statistique', 'performance', 'progression'])) {
            return 'stats';
        } elseif (str_contains($message, ['équipe', 'collaborateur', 'membre'])) {
            return 'team';
        }

        return 'general';
    }

    private function generateResponse($intent, $context, $message)
    {
        switch ($intent) {
            case 'tasks':
                return $this->handleTasksIntent($context);
            case 'projects':
                return $this->handleProjectsIntent($context);
            case 'help':
                return $this->handleHelpIntent();
            case 'stats':
                return $this->handleStatsIntent($context);
            case 'team':
                return $this->handleTeamIntent($context);
            default:
                return $this->handleGeneralIntent($message);
        }
    }

    private function handleTasksIntent($context)
    {
        $tasks = $context['tasks'];
        $overdueTasks = $tasks->filter(function ($task) {
            return $task->due_date < now() && $task->status !== 'completed';
        });

        $message = "Voici un résumé de vos tâches :\n";
        $message .= "- Total : " . $tasks->count() . " tâches\n";
        $message .= "- En retard : " . $overdueTasks->count() . " tâches\n";
        $message .= "- À faire aujourd'hui : " . $tasks->where('due_date', today())->count() . " tâches";

        return [
            'message' => $message,
            'suggestions' => [
                'Voir mes tâches en retard',
                'Créer une nouvelle tâche',
                'Voir le calendrier des tâches',
            ],
            'actions' => [
                [
                    'label' => 'Voir toutes mes tâches',
                    'type' => 'navigate',
                    'path' => '/tasks',
                ],
            ],
        ];
    }

    private function handleProjectsIntent($context)
    {
        $projects = $context['projects'];
        $activeProjects = $projects->where('status', 'active');

        $message = "Voici un résumé de vos projets :\n";
        $message .= "- Total : " . $projects->count() . " projets\n";
        $message .= "- Actifs : " . $activeProjects->count() . " projets";

        return [
            'message' => $message,
            'suggestions' => [
                'Voir mes projets actifs',
                'Créer un nouveau projet',
                'Voir les statistiques des projets',
            ],
            'actions' => [
                [
                    'label' => 'Voir tous mes projets',
                    'type' => 'navigate',
                    'path' => '/projects',
                ],
            ],
        ];
    }

    private function handleHelpIntent()
    {
        return [
            'message' => "Je peux vous aider avec :\n- La gestion des tâches\n- Le suivi des projets\n- Les statistiques\n- La collaboration d'équipe\n\nQue souhaitez-vous faire ?",
            'suggestions' => [
                'Comment créer une tâche ?',
                'Comment inviter un membre ?',
                'Comment générer un rapport ?',
            ],
        ];
    }

    private function handleStatsIntent($context)
    {
        $tasks = $context['tasks'];
        $completedTasks = $tasks->where('status', 'completed')->count();
        $totalTasks = $tasks->count();
        $completionRate = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100) : 0;

        $message = "Voici vos statistiques :\n";
        $message .= "- Taux de complétion : " . $completionRate . "%\n";
        $message .= "- Tâches terminées : " . $completedTasks . "\n";
        $message .= "- Tâches totales : " . $totalTasks;

        return [
            'message' => $message,
            'suggestions' => [
                'Voir mes statistiques détaillées',
                'Comparer avec l\'équipe',
                'Exporter les statistiques',
            ],
            'actions' => [
                [
                    'label' => 'Voir le tableau de bord',
                    'type' => 'navigate',
                    'path' => '/dashboard',
                ],
            ],
        ];
    }

    private function handleTeamIntent($context)
    {
        $projects = $context['projects'];
        $teamMembers = collect();

        foreach ($projects as $project) {
            $teamMembers = $teamMembers->merge($project->members);
        }

        $uniqueMembers = $teamMembers->unique('id');

        $message = "Vous collaborez avec " . $uniqueMembers->count() . " membres d'équipe sur " . $projects->count() . " projets.";

        return [
            'message' => $message,
            'suggestions' => [
                'Voir les membres de mon équipe',
                'Inviter un nouveau membre',
                'Voir les rôles et permissions',
            ],
            'actions' => [
                [
                    'label' => 'Gérer l\'équipe',
                    'type' => 'navigate',
                    'path' => '/team',
                ],
            ],
        ];
    }

    private function handleGeneralIntent($message)
    {
        return [
            'message' => "Je ne suis pas sûr de comprendre votre demande. Pouvez-vous la reformuler ou choisir une des suggestions ci-dessous ?",
            'suggestions' => [
                'Quelles sont mes tâches prioritaires ?',
                'Comment optimiser mon temps ?',
                'Quels sont les projets en retard ?',
            ],
        ];
    }
} 