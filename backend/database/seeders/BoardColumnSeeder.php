<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Project;
use App\Models\BoardColumn;

class BoardColumnSeeder extends Seeder
{
    public function run()
    {
        $defaultColumns = [
            ['title' => 'À faire', 'order' => 0],
            ['title' => 'En cours', 'order' => 1],
            ['title' => 'En révision', 'order' => 2],
            ['title' => 'Terminé', 'order' => 3],
        ];

        // Créer les colonnes par défaut pour chaque projet
        Project::all()->each(function ($project) use ($defaultColumns) {
            foreach ($defaultColumns as $column) {
                $project->boardColumns()->create($column);
            }
        });
    }
}