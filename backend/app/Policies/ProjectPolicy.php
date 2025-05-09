<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ProjectPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can manage the project's team.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Project  $project
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function manageTeam(User $user, Project $project)
    {
        // Vérifie si l'utilisateur est membre du projet avec un rôle d'admin ou owner
        return $project->members()
            ->where('user_id', $user->id)
            ->whereIn('role', ['admin', 'owner'])
            ->exists();
    }

    /**
     * Determine whether the user can view the project.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Project  $project
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view(User $user, Project $project)
    {
        // Vérifie si l'utilisateur est membre du projet
        return $project->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine whether the user can update the project.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Project  $project
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function update(User $user, Project $project)
    {
        // Vérifie si l'utilisateur est membre du projet avec un rôle d'admin ou owner
        return $this->manageTeam($user, $project);
    }

    /**
     * Determine whether the user can delete the project.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Project  $project
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function delete(User $user, Project $project)
    {
        // Seul le propriétaire peut supprimer le projet
        return $project->members()
            ->where('user_id', $user->id)
            ->where('role', 'owner')
            ->exists();
    }
} 