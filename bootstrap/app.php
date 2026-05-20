<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'check.category' => \App\Http\Middleware\CheckCategoryRequest::class,
            'check.user'     => \App\Http\Middleware\CheckUserRequest::class,
            'check.profile'  => \App\Http\Middleware\CheckProfileRequest::class,
            'check.order'    => \App\Http\Middleware\CheckOrderRequest::class,
            'role'           => \App\Http\Middleware\RoleMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();