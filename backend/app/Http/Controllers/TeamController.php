<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TeamController extends Controller
{
    /**
     * Display a listing of team members.
     */
    public function index()
    {
        $user = Auth::user();
        $teamMembers = collect();

        // Récupérer tous les projets où l'utilisateur est membre
        $projects = Project::whereHas('members', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->get();

        // Collecter tous les membres uniques des projets
        foreach ($projects as $project) {
            $teamMembers = $teamMembers->merge($project->members);
        }

        $uniqueMembers = $teamMembers->unique('id');

        return response()->json([
            'members' => $uniqueMembers,
            'total_projects' => $projects->count()
        ]);
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