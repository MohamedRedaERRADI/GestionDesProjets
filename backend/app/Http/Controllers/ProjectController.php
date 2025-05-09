<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProjectController extends Controller
{
    // Display a listing of the projects
    public function index()
    {
        try {
            $projects = Project::where(function($query) {
                $query->where('user_id', Auth::id())
                      ->orWhereHas('members', function($q) {
                          $q->where('user_id', Auth::id());
                      });
            })
            ->orderBy('created_at', 'desc')
            ->get();

            return response()->json($projects);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch projects: ' . $e->getMessage()
            ], 500);
        }
    }

    // Show the form for creating a new project
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after:start_date',
                'status' => 'required|in:pending,in_progress,completed,cancelled'
            ]);

            // Utiliser une transaction pour s'assurer que toutes les opérations sont effectuées
            return \DB::transaction(function () use ($validated) {
                $project = Project::create(array_merge(
                    $validated,
                    ['user_id' => Auth::id()]
                ));

                // S'assurer que le créateur est ajouté comme owner du projet
                $project->members()->attach(Auth::id(), [
                    'role' => 'owner'
                ]);

                // Recharger le projet avec ses relations
                $project->load('members');

                return response()->json($project, 201);
            });
        } catch (\Exception $e) {
            \Log::error('Error in ProjectController::store', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Failed to create project: ' . $e->getMessage()
            ], 500);
        }
    }


    // Display the specified project
    public function show(Project $project)
    {
        try {
            if ($project->user_id !== Auth::id() && !$project->members()->where('user_id', Auth::id())->exists()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            return response()->json($project);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch project: ' . $e->getMessage()], 500);
        }
    }

    // Show the form for editing the specified project
    public function update(Request $request, Project $project)
    {
        try {
            // Seul le propriétaire ou un admin peut modifier le projet
            if (!($project->user_id === Auth::id() || 
                $project->members()->where('user_id', Auth::id())->where('role', 'admin')->exists())) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $validated = $request->validate([
                'title' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'start_date' => 'sometimes|required|date',
                'end_date' => 'sometimes|required|date|after:start_date',
                'status' => 'sometimes|required|in:pending,in_progress,completed,cancelled'
            ]);

            $project->update($validated);

            return response()->json($project);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update project: ' . $e->getMessage()], 500);
        }
    }

    // Remove the specified project from storage
    public function destroy(Project $project)
    {
        try {
            // Vérifier si l'utilisateur est le propriétaire ou un admin du projet
            if (!($project->user_id === Auth::id() || 
                $project->members()->where('user_id', Auth::id())->where('role', 'admin')->exists())) {
                return response()->json(['message' => 'Unauthorized - Only the project owner or admin can delete the project'], 403);
            }

            return \DB::transaction(function () use ($project) {
                // Vérifier si le projet existe encore
                if (!$project->exists) {
                    return response()->json(['message' => 'Project not found'], 404);
                }

                // Supprimer les commentaires associés
                $project->comments()->delete();

                // Supprimer les assignations de tâches
                foreach ($project->tasks as $task) {
                    $task->assignments()->delete();
                }

                // Supprimer les tâches
                $project->tasks()->delete();

                // Supprimer les membres du projet
                $project->members()->detach();

                // Supprimer le projet
                $project->delete();

                \Log::info('Project deleted successfully', ['project_id' => $project->id]);

                return response()->json([
                    'message' => 'Project and all related data deleted successfully'
                ], 200);
            });

        } catch (\Exception $e) {
            \Log::error('Error in ProjectController::destroy', [
                'project_id' => $project->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Failed to delete project: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get the team members of a project.
     *
     * @param Project $project
     * @return \Illuminate\Http\JsonResponse
     */
    public function teamMembers(Project $project)
    {
        try {
            // Vérifier si l'utilisateur a le droit de voir les membres du projet
            if (!$project->members()->where('user_id', Auth::id())->exists()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // Récupérer tous les membres du projet avec leurs rôles
            $members = $project->members()
                ->select('users.id', 'users.name', 'users.email', 'project_members.role')
                ->get();

            return response()->json($members);
        } catch (\Exception $e) {
            \Log::error('Error in ProjectController::teamMembers', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Failed to fetch team members: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get tasks of a project.
     *
     * @param Project $project
     * @return \Illuminate\Http\JsonResponse
     */
    public function tasks(Project $project)
    {
        try {
            // Vérifier si l'utilisateur a le droit de voir les tâches du projet
            if (!$project->members()->where('user_id', Auth::id())->exists()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // Récupérer toutes les tâches du projet avec leurs assignations
            $tasks = $project->tasks()
                ->with(['assignee' => function($query) {
                    $query->select('id', 'name', 'email');
                }])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($tasks);
        } catch (\Exception $e) {
            \Log::error('Error in ProjectController::tasks', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Failed to fetch tasks: ' . $e->getMessage()
            ], 500);
        }
    }
}