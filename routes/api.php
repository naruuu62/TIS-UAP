<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\TagController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\ProfilesController;
use App\Http\Middleware\CheckUserRequest;
use App\Http\Middleware\CheckProfileRequest;
use App\Http\Middleware\CheckOrderRequest;

// ─── AUTH (public) ────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);

    Route::middleware('auth:api')->group(function () {
        Route::post('/logout',  [AuthController::class, 'logout']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
        Route::get('/me',       [AuthController::class, 'me']);
    });
});

// ─── PROTECTED ROUTES (JWT required) ──────────────────────
Route::middleware('auth:api')->group(function () {

    // Categories — GET semua role, POST/PUT/DELETE admin only
    Route::get('/categories',      [CategoryController::class, 'index']);
    Route::get('/categories/{id}', [CategoryController::class, 'show']);
    Route::middleware('role:admin')->group(function () {
        Route::post('/categories',        [CategoryController::class, 'store']);
        Route::put('/categories/{id}',    [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
    });

    // Users — admin only
    Route::middleware([CheckUserRequest::class, 'role:admin'])->prefix('users')->group(function () {
        Route::post('/',       [UsersController::class, 'createUsers']);
        Route::get('/',        [UsersController::class, 'getUsers']);
        Route::get('/{id}',    [UsersController::class, 'getUsersById']);
        Route::put('/{id}',    [UsersController::class, 'updateUser']);
        Route::delete('/{id}', [UsersController::class, 'deleteUser']);
    });

    // Profiles — semua role
    Route::middleware([CheckProfileRequest::class])->prefix('profiles')->group(function () {
        Route::post('/',     [ProfilesController::class, 'createProfiles']);
        Route::get('/',      [ProfilesController::class, 'getProfiles']);
        Route::get('/users', [ProfilesController::class, 'getUsersWithProfiles']);
        Route::get('/{id}',  [ProfilesController::class, 'getProfilesById']);
        Route::put('/{id}',    [ProfilesController::class, 'updateProfile']);
        Route::patch('/{id}',  [ProfilesController::class, 'updateProfile']);
        Route::delete('/{id}', [ProfilesController::class, 'destroyProfile']);
    });

    // Products — GET semua role, POST seller/admin, PUT/DELETE admin only
    Route::get('/products',      [ProductController::class, 'index']);
    Route::get('/products/{id}', [ProductController::class, 'show']);
    Route::middleware('role:admin,seller')->group(function () {
        Route::post('/products', [ProductController::class, 'store']);
    });
    Route::middleware('role:admin,seller')->group(function () {
        Route::put('/products/{id}',    [ProductController::class, 'update']);
    });
    Route::middleware('role:admin')->group(function () {
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    });

    // Orders — semua role bisa list/detail/buat; hanya admin yang bisa hapus
    Route::middleware([CheckOrderRequest::class])->group(function () {
        Route::post('/orders',     [OrderController::class, 'store']);
        Route::get('/orders',      [OrderController::class, 'index']);
        Route::get('/orders/{id}', [OrderController::class, 'show']);
    });
    Route::middleware('role:admin')->delete('/orders/{id}', [OrderController::class, 'destroy']);

    // Tags — GET semua role, POST/PUT/DELETE admin only
    Route::get('/tags',       [TagController::class, 'index']);
    Route::get('/tags/{id}',  [TagController::class, 'show']);
    Route::middleware('role:admin')->group(function () {
        Route::post('/tags',        [TagController::class, 'store']);
        Route::put('/tags/{id}',    [TagController::class, 'update']);
        Route::delete('/tags/{id}', [TagController::class, 'destroy']);
    });
    // Seller can attach/detach tags & categories on their own products
    Route::middleware('role:admin,seller')->group(function () {
        Route::put('/products/{id}/tag/{tagId}',              [TagController::class,      'attachTag']);
        Route::delete('/products/{id}/tag/{tagId}',           [TagController::class,      'detachTag']);
        Route::put('/products/{id}/category/{categoryId}',    [CategoryController::class, 'attachCategory']);
        Route::delete('/products/{id}/category/{categoryId}', [CategoryController::class, 'detachCategory']);
    });
});
