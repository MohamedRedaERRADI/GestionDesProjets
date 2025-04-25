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

    // Dashboard routes
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
    Route::get('/dashboard/recent-projects', [DashboardController::class, 'getRecentProjects']);
    Route::get('/dashboard/upcoming-tasks', [DashboardController::class, 'getUpcomingTasks']);

    // Projects routes
    Route::apiResource('projects', ProjectController::class);
    Route::get('projects/{project}/tasks', [ProjectController::class, 'tasks']);

    // Tasks routes
    Route::apiResource('tasks', TaskController::class);

    // Team routes
    Route::apiResource('team', TeamController::class);

    // Calendar routes
    Route::get('calendar/events', [CalendarController::class, 'events']);

    // Reports routes
    Route::get('reports', [ReportController::class, 'index']);

    // Routes pour les commentaires
    Route::get('/tasks/{task}/comments', [CommentController::class, 'index']);
    Route::post('/tasks/{task}/comments', [CommentController::class, 'store']);
    Route::put('/tasks/{task}/comments/{comment}', [CommentController::class, 'update']);
    Route::delete('/tasks/{task}/comments/{comment}', [CommentController::class, 'destroy']);

    // Routes de l'assistant IA
    Route::post('/ai/assistant', [AIAssistantController::class, 'handle']);
});
