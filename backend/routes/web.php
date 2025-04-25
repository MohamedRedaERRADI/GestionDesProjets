<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Public routes
Route::get('/', function () {
    return view('welcome');
})->name('home');

// Authentication routes
Route::prefix('auth')->group(function () {
    Route::post('/login', [\App\Http\Controllers\AuthController::class, 'login'])->name('auth.login');
    Route::post('/register', [\App\Http\Controllers\AuthController::class, 'register'])->name('auth.register');
    Route::post('/logout', [\App\Http\Controllers\AuthController::class, 'logout'])->name('auth.logout');
    Route::get('/user', [\App\Http\Controllers\AuthController::class, 'user'])->name('auth.user');
});

// Protected routes (require authentication)
Route::middleware(['auth'])->group(function () {
    // Dashboard routes
    Route::prefix('dashboard')->group(function () {
        Route::get('/', function () {
            return view('dashboard');
        })->name('dashboard');
        Route::get('/stats', [\App\Http\Controllers\DashboardController::class, 'getStats'])->name('dashboard.stats');
        Route::get('/recent-projects', [\App\Http\Controllers\DashboardController::class, 'getRecentProjects'])->name('dashboard.recent-projects');
        Route::get('/upcoming-tasks', [\App\Http\Controllers\DashboardController::class, 'getUpcomingTasks'])->name('dashboard.upcoming-tasks');
    });

    // Calendar routes
    Route::prefix('calendar')->group(function () {
        Route::get('/', [\App\Http\Controllers\CalendarController::class, 'index'])->name('calendar.index');
        Route::get('/stats', [\App\Http\Controllers\CalendarController::class, 'stats'])->name('calendar.stats');
    });

    // Project management routes
    Route::prefix('projects')->group(function () {
        Route::get('/', [\App\Http\Controllers\ProjectController::class, 'index'])->name('projects.index');
        Route::post('/', [\App\Http\Controllers\ProjectController::class, 'store'])->name('projects.store');
        Route::get('/{project}', [\App\Http\Controllers\ProjectController::class, 'show'])->name('projects.show');
        Route::put('/{project}', [\App\Http\Controllers\ProjectController::class, 'update'])->name('projects.update');
        Route::delete('/{project}', [\App\Http\Controllers\ProjectController::class, 'destroy'])->name('projects.destroy');

        // Team management routes within projects
        Route::prefix('{project}/team')->group(function () {
            Route::get('/', [\App\Http\Controllers\TeamController::class, 'index'])->name('team.index');
            Route::post('/invite', [\App\Http\Controllers\TeamController::class, 'invite'])->name('team.invite');
            Route::delete('/{user}', [\App\Http\Controllers\TeamController::class, 'remove'])->name('team.remove');
            Route::put('/{user}/role', [\App\Http\Controllers\TeamController::class, 'updateRole'])->name('team.update-role');
        });

        // Report routes within projects
        Route::prefix('{project}/reports')->group(function () {
            Route::get('/progress', [\App\Http\Controllers\ReportController::class, 'projectProgress'])->name('reports.project-progress');
            Route::get('/team-performance', [\App\Http\Controllers\ReportController::class, 'teamPerformance'])->name('reports.team-performance');
        });
    });

    // Task management routes
    Route::prefix('tasks')->group(function () {
        Route::get('/', [\App\Http\Controllers\TaskController::class, 'index'])->name('tasks.index');
        Route::get('/create', [\App\Http\Controllers\TaskController::class, 'create'])->name('tasks.create');
        Route::post('/', [\App\Http\Controllers\TaskController::class, 'store'])->name('tasks.store');
        Route::get('/{id}', [\App\Http\Controllers\TaskController::class, 'show'])->name('tasks.show');
        Route::put('/{id}', [\App\Http\Controllers\TaskController::class, 'update'])->name('tasks.update');
        Route::delete('/{id}', [\App\Http\Controllers\TaskController::class, 'destroy'])->name('tasks.destroy');
    });

    // Comment routes
    Route::prefix('tasks/{task}/comments')->group(function () {
        Route::get('/', [\App\Http\Controllers\CommentController::class, 'index'])->name('comments.index');
        Route::post('/', [\App\Http\Controllers\CommentController::class, 'store'])->name('comments.store');
        Route::put('/{comment}', [\App\Http\Controllers\CommentController::class, 'update'])->name('comments.update');
        Route::delete('/{comment}', [\App\Http\Controllers\CommentController::class, 'destroy'])->name('comments.destroy');
    });

    // AI Assistant routes
    Route::prefix('ai-assistant')->group(function () {
        Route::post('/handle', [\App\Http\Controllers\AIAssistantController::class, 'handle'])->name('ai-assistant.handle');
    });

    // User performance report route
    Route::get('/users/{user}/performance', [\App\Http\Controllers\ReportController::class, 'userPerformance'])
        ->name('reports.user-performance');

    // User settings route
    Route::get('/settings', function () {
        return view('settings');
    })->name('settings');
});

// Fallback route for 404 errors
Route::fallback(function () {
    return view('errors.404');
});
