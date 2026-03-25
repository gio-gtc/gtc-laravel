<?php

use App\Http\Controllers\Api\ChannelMessageController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DemoController;
use App\Http\Controllers\InvoicesController;
use App\Http\Controllers\OrdersController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('/demo/{uuid}', [DemoController::class, 'show'])
    ->whereUuid('uuid')
    ->name('demo.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::get('orders', OrdersController::class)->name('orders');

    Route::get('invoices', InvoicesController::class)->name('invoices');

    Route::prefix('api')->group(function () {
        Route::patch('channels/{channelId}/messages/{id}', [ChannelMessageController::class, 'update']);
        Route::delete('channels/{channelId}/messages/{id}', [ChannelMessageController::class, 'destroy']);
    });
});

require __DIR__.'/settings.php';
