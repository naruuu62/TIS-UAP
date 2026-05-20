<?php

use Illuminate\Support\Facades\Route;

// Semua route web diarahkan ke React SPA
Route::get('/{any}', function () {
    return view('app');
})->where('any', '^(?!api).*');
