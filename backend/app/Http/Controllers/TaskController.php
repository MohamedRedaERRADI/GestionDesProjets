<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class TaskController extends Controller
{
    public function index()
    {
        try {
            $user = Auth::user();
            $tasks = Task::whereHas('project', function($query) use ($user) {
                $query->whereHas('members', function($q) use ($user) {
                    $q->where('user_id', $user->id);
                });
            })->with(['project', 'assignee'])->get();

            return response()->json($tasks);
        } catch (\Exception $e) {
            Log::error('Error fetching tasks:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Failed to fetch tasks: ' . $e->getMessage()], 500);
        }
    }

    public function create()
    {
        return response()->json(['message' => 'Méthode non supportée dans l\'API'], 405);
    }

    public function store(Request $request)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'status' => 'required|in:pending,in_progress,completed',
                'due_date' => 'nullable|date',
                'project_id' => 'required|exists:projects,id',
                'priority' => 'required|in:low,medium,high',
                'assignee_id' => 'nullable|exists:users,id'
            ]);

            // Vérifier si l'utilisateur a accès au projet
            $project = Project::findOrFail($validated['project_id']);
            if (!$project->members()->where('user_id', Auth::id())->exists()) {
                DB::rollBack();
                return response()->json(['error' => 'Unauthorized access to project'], 403);
            }

            // Si aucun assignee_id n'est fourni, assigner la tâche au créateur
            if (!isset($validated['assignee_id'])) {
                $validated['assignee_id'] = Auth::id();
            }

            // Vérifier si l'assignee est membre du projet
            if (!$project->members()->where('user_id', $validated['assignee_id'])->exists()) {
                DB::rollBack();
                return response()->json(['error' => 'Assignee must be a member of the project'], 422);
            }

            $task = new Task($validated);
            $task->created_by = Auth::id();
            $task->save();

            DB::commit();

            // Recharger la tâche avec ses relations
            $task->load(['project', 'assignee']);

            Log::info('Task created successfully:', ['task_id' => $task->id]);
            return response()->json($task, 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating task:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            return response()->json(['error' => 'Failed to create task: ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        try {
            $task = Task::with(['project', 'assignee'])->findOrFail($id);
            // Vérifier si l'utilisateur a accès au projet de la tâche
            if (!$task->project->members()->where('user_id', Auth::id())->exists()) {
                return response()->json(['error' => 'Unauthorized access to task'], 403);
            }
            return response()->json($task);
        } catch (\Exception $e) {
            Log::error('Error fetching task:', [
                'task_id' => $id,
                'error' => $e->getMessage()
            ]);
            return response()->json(['error' => 'Failed to fetch task'], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $task = Task::findOrFail($id);
            
            // Vérifier si l'utilisateur a accès au projet actuel de la tâche
            if (!$task->project->members()->where('user_id', Auth::id())->exists()) {
                DB::rollBack();
                return response()->json(['error' => 'Unauthorized access to task'], 403);
            }

            $validated = $request->validate([
                'title' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'status' => 'sometimes|required|in:pending,in_progress,completed',
                'due_date' => 'nullable|date',
                'project_id' => 'sometimes|required|exists:projects,id',
                'priority' => 'sometimes|required|in:low,medium,high',
                'assignee_id' => 'nullable|exists:users,id'
            ]);

            // Si le projet est modifié, vérifier l'accès au nouveau projet
            if (isset($validated['project_id']) && $validated['project_id'] !== $task->project_id) {
                $newProject = Project::findOrFail($validated['project_id']);
                if (!$newProject->members()->where('user_id', Auth::id())->exists()) {
                    DB::rollBack();
                    return response()->json(['error' => 'Unauthorized access to new project'], 403);
                }
            }

            // Vérifier si l'assignee est membre du projet
            if (isset($validated['assignee_id'])) {
                $project = Project::findOrFail($validated['project_id'] ?? $task->project_id);
                if (!$project->members()->where('user_id', $validated['assignee_id'])->exists()) {
                    DB::rollBack();
                    return response()->json(['error' => 'Assignee must be a member of the project'], 422);
                }
            }

            $task->update($validated);
            
            DB::commit();

            // Recharger la tâche avec ses relations
            $task->load(['project', 'assignee']);

            Log::info('Task updated successfully:', ['task_id' => $task->id]);
            return response()->json($task);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating task:', [
                'task_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            return response()->json(['error' => 'Failed to update task: ' . $e->getMessage()], 500);
        }
    }

    public function updateStatus(Request $request, Task $task)
    {
        try {
            // Vérifier si l'utilisateur a accès au projet de la tâche
            if (!$task->project->members()->where('user_id', Auth::id())->exists()) {
                return response()->json(['error' => 'Unauthorized access to task'], 403);
            }

            $validated = $request->validate([
                'status' => 'required|string'
            ]);

            // Vérifier si la colonne existe dans le projet
            $columnExists = $task->project->boardColumns()
                ->where('identifier', $validated['status'])
                ->exists();

            if (!$columnExists) {
                return response()->json(['error' => 'Invalid column identifier'], 422);
            }

            $task->status = $validated['status'];
            $task->save();

            // Recharger la tâche avec ses relations
            $task->load(['project', 'assignee']);

            return response()->json($task);
        } catch (\Exception $e) {
            Log::error('Error updating task status:', [
                'task_id' => $task->id,
                'error' => $e->getMessage()
            ]);
            return response()->json(['error' => 'Failed to update task status'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $task = Task::findOrFail($id);
            
            // Vérifier si l'utilisateur a accès au projet
            if (!$task->project->members()->where('user_id', Auth::id())->exists()) {
                DB::rollBack();
                return response()->json(['error' => 'Unauthorized access to task'], 403);
            }

            $task->delete();
            
            DB::commit();
            
            Log::info('Task deleted successfully:', ['task_id' => $id]);
            return response()->json(['message' => 'Task deleted successfully']);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting task:', [
                'task_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Failed to delete task: ' . $e->getMessage()], 500);
        }
    }
}