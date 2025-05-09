<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\AIAssistantController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\BoardColumnController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Routes publiques
Route::post('auth/login', [AuthController::class, 'login']);
Route::post('auth/register', [AuthController::class, 'register']);

// Routes protégées
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/user', [AuthController::class, 'user']);
    Route::put('users/profile', [AuthController::class, 'updateProfile']);

    // Dashboard routes
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
    Route::get('/dashboard/recent-projects', [DashboardController::class, 'getRecentProjects']);
    Route::get('/dashboard/upcoming-tasks', [DashboardController::class, 'getUpcomingTasks']);

    // Projects routes
    Route::apiResource('projects', ProjectController::class);
    Route::get('projects/{project}/tasks', [ProjectController::class, 'tasks']);
    Route::get('projects/{project}/team', [ProjectController::class, 'teamMembers']);

    // Tasks routes
    Route::apiResource('tasks', TaskController::class);

    // Team routes
    Route::apiResource('team', TeamController::class);
    Route::post('projects/{project}/team/invite', [TeamController::class, 'invite']);
    Route::delete('projects/{project}/team/{user}', [TeamController::class, 'remove']);
    Route::put('projects/{project}/team/{user}/role', [TeamController::class, 'updateRole']);

    // Calendar routes
    Route::get('calendar/events', [CalendarController::class, 'index']);

    // Reports routes
    Route::get('reports', [ReportController::class, 'index']);
    Route::get('reports/project-progress/{project}', [ReportController::class, 'projectProgress']);
    Route::get('reports/user-performance/{user}', [ReportController::class, 'userPerformance']);
    Route::get('reports/team-performance/{project}', [ReportController::class, 'teamPerformance']);

    // Routes pour les commentaires
    Route::get('/tasks/{task}/comments', [CommentController::class, 'index']);
    Route::post('/tasks/{task}/comments', [CommentController::class, 'store']);
    Route::put('/tasks/{task}/comments/{comment}', [CommentController::class, 'update']);
    Route::delete('/tasks/{task}/comments/{comment}', [CommentController::class, 'destroy']);

    // Routes de l'assistant IA
    Route::post('/ai/assistant', [AIAssistantController::class, 'handle']);

    // Board routes
    Route::get('/projects/{project}/board', [BoardColumnController::class, 'index']);
    Route::post('/projects/{project}/board', [BoardColumnController::class, 'store']);
    Route::put('/projects/{project}/board/{column}', [BoardColumnController::class, 'update']);
    Route::delete('/projects/{project}/board/{column}', [BoardColumnController::class, 'destroy']);
    
    // Update task status
    Route::patch('/tasks/{task}/status', [TaskController::class, 'updateStatus']);
});
