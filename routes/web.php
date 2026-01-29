<?php

use App\Http\Controllers\Api\ChannelMessageController;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('orders', function () {
        return Inertia::render('orders');
    })->name('orders');

    Route::get('invoices', function () {
        return Inertia::render('invoices');
    })->name('invoices');

    Route::prefix('api')->group(function () {
        Route::patch('channels/{channelId}/messages/{id}', [ChannelMessageController::class, 'update']);
        Route::delete('channels/{channelId}/messages/{id}', [ChannelMessageController::class, 'destroy']);
    });
});

require __DIR__.'/settings.php';
