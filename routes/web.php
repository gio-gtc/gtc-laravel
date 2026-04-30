<?php

use App\Http\Controllers\Api\ChannelMessageController;
use App\Http\Controllers\Auth\BffLoginController;
use App\Http\Controllers\Auth\BffLogoutController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DemoController;
use App\Http\Controllers\InvoicesController;
use App\Http\Controllers\OrdersController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\VenueFormController;
use App\Http\Middleware\BffAuth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => false, 
    ]);
})->name('home');

Route::get('/login', [BffLoginController::class, 'create'])->name('login')->middleware('guest');
Route::post('/login', [BffLoginController::class, 'store'])->name('login.store')->middleware('guest');
Route::post('/logout', [BffLogoutController::class, 'destroy'])->name('logout');

Route::get('/demo/{uuid}/{assetId?}', [DemoController::class, 'show'])
    ->whereUuid('uuid')
    ->where('assetId', '[a-zA-Z0-9_-]+')
    ->name('demo.show');


Route::middleware([BffAuth::class])->group(function () {
    
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::get('orders', OrdersController::class)->name('orders');
    Route::get('invoices', InvoicesController::class)->name('invoices');

    // NOTE ON VENUES: We changed {venue:mock_venue_id} to {venueId}.
    // Route Model Binding requires a database to auto-fetch the record. 
    // Since the database is gone, we just pass the ID string to the controller instead.
    Route::get('/venue-forms/{venueId}/schema', [VenueFormController::class, 'show'])->name('venue.form.show');
    Route::post('/venue-forms/{venueId}', [VenueFormController::class, 'store'])->name('venue.form.store');

    Route::post('/uploads', [UploadController::class, 'store'])->name('uploads.store');

    Route::prefix('api')->group(function () {
        Route::patch('channels/{channelId}/messages/{id}', [ChannelMessageController::class, 'update']);
        Route::delete('channels/{channelId}/messages/{id}', [ChannelMessageController::class, 'destroy']);
    });
});

require __DIR__.'/settings.php';