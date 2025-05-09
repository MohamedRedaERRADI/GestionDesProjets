<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\BoardColumn;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class BoardColumnController extends Controller
{
    public function index(Project $project)
    {
        try {
            // Vérifier si l'utilisateur a accès au projet
            if (!$project->members()->where('user_id', Auth::id())->exists()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            // Récupérer les colonnes fixes avec leurs tâches
            $fixedColumns = [
                [
                    'id' => 'todo',
                    'identifier' => 'todo',
                    'title' => 'À faire',
                    'tasks' => $project->tasks()->where('status', 'todo')->get(),
                    'isFixed' => true
                ],
                [
                    'id' => 'in_progress',
                    'identifier' => 'in_progress',
                    'title' => 'En cours',
                    'tasks' => $project->tasks()->where('status', 'in_progress')->get(),
                    'isFixed' => true
                ],
                [
                    'id' => 'completed',
                    'identifier' => 'completed',
                    'title' => 'Terminé',
                    'tasks' => $project->tasks()->where('status', 'completed')->get(),
                    'isFixed' => true
                ]
            ];

            // Récupérer les colonnes personnalisées
            $customColumns = $project->boardColumns()
                ->with(['tasks' => function($query) {
                    $query->with(['assignee']); // Inclure les informations de l'assignée
                }])
                ->get()
                ->map(function($column) {
                    return array_merge($column->toArray(), ['isFixed' => false]);
                });

            // Combiner les colonnes fixes et personnalisées
            $allColumns = array_merge($fixedColumns, $customColumns->toArray());

            return response()->json($allColumns);

        } catch (\Exception $e) {
            Log::error('Error in BoardColumnController::index', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Failed to fetch board columns'], 500);
        }
    }

    public function store(Request $request, Project $project)
    {
        try {
            if (!$project->members()->where('user_id', Auth::id())->exists()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $validated = $request->validate([
                'title' => 'required|string|max:255'
            ]);

            // Créer un identifiant unique pour la nouvelle colonne
            $identifier = strtolower(str_replace(' ', '_', $validated['title']));
            
            // Trouver l'ordre maximum actuel et ajouter 1
            $maxOrder = $project->boardColumns()->max('order') ?? 0;

            $column = $project->boardColumns()->create([
                'title' => $validated['title'],
                'identifier' => $identifier,
                'order' => $maxOrder + 1
            ]);

            return response()->json($column, 201);

        } catch (\Exception $e) {
            Log::error('Error in BoardColumnController::store', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Failed to create board column'], 500);
        }
    }

    public function update(Request $request, Project $project, BoardColumn $column)
    {
        try {
            if (!$project->members()->where('user_id', Auth::id())->exists()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'order' => 'sometimes|integer|min:0'
            ]);

            $column->update($validated);

            return response()->json($column);

        } catch (\Exception $e) {
            Log::error('Error in BoardColumnController::update', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Failed to update board column'], 500);
        }
    }

    public function destroy(Project $project, BoardColumn $column)
    {
        try {
            if (!$project->members()->where('user_id', Auth::id())->exists()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            // Empêcher la suppression des colonnes fixes
            if (in_array($column->identifier, ['todo', 'in_progress', 'completed'])) {
                return response()->json(['error' => 'Cannot delete fixed columns'], 422);
            }

            $column->delete();

            return response()->json(['message' => 'Column deleted successfully']);

        } catch (\Exception $e) {
            Log::error('Error in BoardColumnController::destroy', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Failed to delete board column'], 500);
        }
    }
}