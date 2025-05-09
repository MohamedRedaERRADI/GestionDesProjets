<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Project;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TeamController extends Controller
{
    /**
     * cette fonction est utilisée pour afficher la liste des membres de l'équipe
     * d'un projet spécifique. Elle vérifie d'abord si l'utilisateur est authentifié,
     */
    public function index()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }
            
            // Récupérer tous les projets où l'utilisateur est membre
            $projects = Project::whereHas('members', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })->get();
    
            // Collecter tous les membres uniques des projets avec leurs rôles
            $allMembers = collect();
            
            foreach ($projects as $project) {
                $projectMembers = $project->members()
                    ->select('users.id', 'users.name', 'users.email', 'project_members.role')
                    ->get();
                    
                $allMembers = $allMembers->concat($projectMembers);
            }
    
            // Éliminer les doublons basés sur l'ID utilisateur
            $uniqueMembers = $allMembers->unique('id')->values();
            
            // Log pour déboguer
            \Log::info('Team members returned:', ['count' => $uniqueMembers->count(), 'members' => $uniqueMembers]);
    
            return response()->json($uniqueMembers);
        } catch (\Exception $e) {
            \Log::error('Error in TeamController::index', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * fonction pour ajouter un membre à l'équipe d'un projet
     * en fonction de l'email et du rôle fournis dans la requête.
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email|exists:users,email',
                'role' => 'required|in:member,admin'
            ]);

            $user = User::where('email', $request->email)->first();
            $authUser = Auth::user();

            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }

            // Récupérer les projets où l'utilisateur authentifié est admin
            $adminProjects = Project::whereHas('members', function ($query) use ($authUser) {
                $query->where('user_id', $authUser->id)
                    ->whereIn('role', ['admin', 'owner']);
            })->get();

            if ($adminProjects->isEmpty()) {
                return response()->json(['error' => 'You do not have permission to add members'], 403);
            }

            $addedToProjects = [];

            // Ajouter l'utilisateur à tous les projets où l'utilisateur authentifié est admin
            foreach ($adminProjects as $project) {
                // Vérifier si l'utilisateur n'est pas déjà membre de ce projet
                if (!$project->members()->where('user_id', $user->id)->exists()) {
                    $project->members()->attach($user->id, [
                        'role' => $request->role
                    ]);
                    $addedToProjects[] = $project->title;
                }
            }

            // Ajouter les informations du rôle
            $user->setAttribute('role', $request->role);

            return response()->json([
                'message' => 'Member added successfully to ' . count($addedToProjects) . ' projects',
                'projects' => $addedToProjects,
                'member' => $user
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Error in TeamController::store', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $user = User::findOrFail($id);
            $authUser = Auth::user();

            // Vérifier si l'utilisateur authentifié a le droit de voir ce membre
            $hasAccess = Project::whereHas('members', function($query) use ($authUser) {
                $query->where('user_id', $authUser->id);
            })->whereHas('members', function($query) use ($id) {
                $query->where('user_id', $id);
            })->exists();

            if (!$hasAccess && $authUser->id !== (int)$id) {
                return response()->json([
                    'error' => 'You do not have permission to view this team member'
                ], 403);
            }

            // Récupérer les informations du membre avec ses rôles dans les projets
            $memberInfo = $user->load(['projects' => function($query) {
                $query->select('projects.id', 'projects.title')
                      ->withPivot('role');
            }]);

            return response()->json($memberInfo);
        } catch (\Exception $e) {
            \Log::error('Error in TeamController::show', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Failed to fetch team member: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'role' => 'required|in:member,admin'
            ]);

            $user = User::findOrFail($id);
            $authUser = Auth::user();

            // Récupérer les projets communs où l'utilisateur authentifié est admin
            $commonProjects = Project::whereHas('members', function ($query) use ($authUser) {
                $query->where('user_id', $authUser->id)
                    ->whereIn('role', ['admin', 'owner']);
            })->whereHas('members', function ($query) use ($id) {
                $query->where('user_id', $id);
            })->get();

            if ($commonProjects->isEmpty()) {
                return response()->json([
                    'error' => 'You do not have permission to update this member or member is not in your projects'
                ], 403);
            }

            $updatedProjects = [];

            // Mettre à jour le rôle de l'utilisateur dans tous les projets communs
            foreach ($commonProjects as $project) {
                $project->members()->updateExistingPivot($id, [
                    'role' => $request->role
                ]);
                $updatedProjects[] = $project->title;
            }

            // Ajouter les informations du rôle
            $user->setAttribute('role', $request->role);

            return response()->json([
                'message' => 'Member updated successfully in ' . count($updatedProjects) . ' projects',
                'projects' => $updatedProjects,
                'member' => $user
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in TeamController::update', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $user = User::findOrFail($id);
            $authUser = Auth::user();

            // Empêcher de se supprimer soi-même
            if ($authUser->id === (int)$id) {
                return response()->json([
                    'error' => 'You cannot remove yourself from the team'
                ], 400);
            }

            // Récupérer les projets communs où l'utilisateur authentifié est admin
            $commonProjects = Project::whereHas('members', function ($query) use ($authUser) {
                $query->where('user_id', $authUser->id)
                    ->whereIn('role', ['admin', 'owner']);
            })->whereHas('members', function ($query) use ($id) {
                $query->where('user_id', $id);
            })->get();

            if ($commonProjects->isEmpty()) {
                return response()->json([
                    'error' => 'You do not have permission to remove this member or member is not in your projects'
                ], 403);
            }

            $removedFromProjects = [];

            // Supprimer l'utilisateur de tous les projets communs
            foreach ($commonProjects as $project) {
                $project->members()->detach($id);
                $removedFromProjects[] = $project->title;
            }

            return response()->json([
                'message' => 'Member removed successfully from ' . count($removedFromProjects) . ' projects',
                'projects' => $removedFromProjects
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in TeamController::destroy', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Invite a new team member to a project.
     */
    public function invite(Request $request, Project $project)
    {
        $this->authorize('manage-team', $project);

        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
            'role' => 'required|in:member,admin'
        ]);

        $user = User::where('email', $validated['email'])->first();

        // Vérifier si l'utilisateur n'est pas déjà membre
        if ($project->members()->where('user_id', $user->id)->exists()) {
            return response()->json([
                'message' => 'User is already a member of this project'
            ], 422);
        }

        // Ajouter le membre au projet
        $project->members()->attach($user->id, [
            'role' => $validated['role']
        ]);

        return response()->json([
            'message' => 'User invited successfully',
            'member' => $user
        ], 201);
    }

    /**
     * Remove a team member from a project.
     */
    public function remove(Request $request, Project $project, User $user)
    {
        $this->authorize('manage-team', $project);

        // Vérifier si l'utilisateur est bien membre du projet
        if (!$project->members()->where('user_id', $user->id)->exists()) {
            return response()->json([
                'message' => 'User is not a member of this project'
            ], 422);
        }

        // Supprimer le membre du projet
        $project->members()->detach($user->id);

        return response()->json([
            'message' => 'User removed successfully'
        ]);
    }

    /**
     * Update a team member's role in a project.
     */
    public function updateRole(Request $request, Project $project, User $user)
    {
        $this->authorize('manage-team', $project);

        $validated = $request->validate([
            'role' => 'required|in:member,admin'
        ]);

        // Vérifier si l'utilisateur est bien membre du projet
        if (!$project->members()->where('user_id', $user->id)->exists()) {
            return response()->json([
                'message' => 'User is not a member of this project'
            ], 422);
        }

        // Mettre à jour le rôle
        $project->members()->updateExistingPivot($user->id, [
            'role' => $validated['role']
        ]);

        return response()->json([
            'message' => 'Role updated successfully'
        ]);
    }
}