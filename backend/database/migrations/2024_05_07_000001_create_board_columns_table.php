<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        Schema::create('board_columns', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('identifier')->unique(); // identifiant unique pour la colonne
            $table->integer('order')->default(0);
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['project_id', 'order']);
        });

        // Créer les colonnes par défaut pour chaque projet existant
        $projects = DB::table('projects')->get();
        $defaultColumns = [
            ['title' => 'À faire', 'identifier' => 'todo', 'order' => 0],
            ['title' => 'En cours', 'identifier' => 'in_progress', 'order' => 1],
            ['title' => 'En révision', 'identifier' => 'review', 'order' => 2],
            ['title' => 'Terminé', 'identifier' => 'done', 'order' => 3]
        ];

        foreach ($projects as $project) {
            foreach ($defaultColumns as $column) {
                DB::table('board_columns')->insert([
                    'title' => $column['title'],
                    'identifier' => $column['identifier'],
                    'order' => $column['order'],
                    'project_id' => $project->id,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        }

        // Mettre à jour les statuts existants des tâches pour correspondre aux nouveaux identifiants
        DB::table('tasks')
            ->where('status', 'pending')
            ->update(['status' => 'todo']);
        
        DB::table('tasks')
            ->where('status', 'completed')
            ->update(['status' => 'done']);
    }

    public function down()
    {
        // Restaurer les anciens statuts
        DB::table('tasks')
            ->where('status', 'todo')
            ->update(['status' => 'pending']);
        
        DB::table('tasks')
            ->where('status', 'done')
            ->update(['status' => 'completed']);

        Schema::dropIfExists('board_columns');
    }
};