<?php

use App\Http\Controllers\Api\ChannelMessageController;
use App\Http\Controllers\Api\OrderCatalogMenuController;
use App\Http\Controllers\Api\OrderItemAssigneesDestroyController;
use App\Http\Controllers\Api\OrderItemAssigneesIndexController;
use App\Http\Controllers\Api\OrderItemAssigneesSyncController;
use App\Http\Controllers\Api\OrderItemDeleteController;
use App\Http\Controllers\Api\OrderItemStoreController as ApiOrderItemStoreController;
use App\Http\Controllers\Api\OrderItemUpdateController;
use App\Http\Controllers\Api\ClientsIndexController;
use App\Http\Controllers\Api\StaffIndexController;
use App\Http\Controllers\Api\OrderShowController;
use App\Http\Controllers\Api\OrderUpdateController;
use App\Http\Controllers\Api\TourIndexController;
use App\Http\Controllers\Api\TourOrdersController;
use App\Http\Controllers\Auth\BffForgotPasswordController;
use App\Http\Controllers\Auth\BffLoginController;
use App\Http\Controllers\Auth\BffLogoutController;
use App\Http\Controllers\Auth\BffRequestAccessController;
use App\Http\Controllers\Auth\BffResetPasswordController;
use App\Http\Controllers\Auth\UserOnboardingProxyController;
use App\Http\Controllers\ContactInviteProxyController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DemoController;
use App\Http\Controllers\InvoicesController;
use App\Http\Controllers\OrderItemStoreController;
use App\Http\Controllers\OrdersController;
use App\Http\Controllers\OrderStoreController;
use App\Http\Controllers\OrderSubmitController;
use App\Http\Controllers\OrganisationController;
use App\Http\Controllers\TourController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\VenueFormController;
use App\Http\Middleware\BffAuth;
use App\Support\GtcApiClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::post('/logout', [BffLogoutController::class, 'destroy'])->name('logout');

Route::middleware('bff.guest')->group(function () {
    Route::get('/demo/{uuid}/{assetId?}', [DemoController::class, 'show'])
        ->whereUuid('uuid')
        ->where('assetId', '[a-zA-Z0-9_-]+')
        ->name('demo.show');

    Route::get('/login', [BffLoginController::class, 'create'])->name('login');
    Route::post('/login', [BffLoginController::class, 'store'])->name('login.store');

    Route::post('/request-access', [BffRequestAccessController::class, 'store'])
        ->name('request-access.store');

    // Show the React form
    Route::get('/forgot-password', [BffForgotPasswordController::class, 'create'])
        ->name('password.request');
    // Handle the form submission (This is the one the test is failing to find!)
    Route::post('/forgot-password', [BffForgotPasswordController::class, 'store'])
        ->name('password.email');

    // The GET route (Shows the React form)
    Route::get('/reset-password', [BffResetPasswordController::class, 'create'])
        ->name('password.reset');
    // The POST route (This is the one your test is failing to find!)
    Route::post('/reset-password', [BffResetPasswordController::class, 'store'])
        ->name('password.store');

    Route::get('/set-password', [UserOnboardingProxyController::class, 'showSetPassword'])
        ->name('set-password.show');
    Route::post('/set-password', [UserOnboardingProxyController::class, 'setPassword'])
        ->name('set-password.store');
});

Route::middleware([BffAuth::class])->group(function () {

    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::get('orders', OrdersController::class)->name('orders');
    Route::post('orders', OrderStoreController::class)->name('orders.store');
    Route::post('orders/{order}/items', OrderItemStoreController::class)->name('orders.items.store');
    Route::post('orders/{order}/submit', OrderSubmitController::class)->name('orders.submit');
    Route::get('invoices', InvoicesController::class)->name('invoices');
    Route::get('/venue-forms/{venueId}/schema', [VenueFormController::class, 'show'])->name('venue.form.show');
    Route::post('/venue-forms/{venueId}', [VenueFormController::class, 'store'])->name('venue.form.store');
    Route::post('/uploads', [UploadController::class, 'store'])->name('uploads.store');

    // VVV New gtc-api proxy routes
    Route::post('/organisations', [OrganisationController::class, 'store'])
        ->name('organisations.store');

    Route::get('/api/search/organisations', function (Request $request) {
        $token = $request->session()->get('api_token');
        $apiUrl = config('services.api.base_url').'/api/organisations';

        // Forward the search query to gtc-api
        $response = Http::withToken($token)
            ->acceptJson()
            ->get($apiUrl, ['search' => $request->query('search')]);

        return $response->successful() ? $response->json() : ['organisations' => []];
    })->name('search.organisations');

    Route::get('/api/search/venues', function (Request $request) {
        $token = $request->session()->get('api_token');
        $apiUrl = config('services.api.base_url').'/api/venues';

        $response = Http::withToken($token)
            ->acceptJson()
            ->get($apiUrl, ['search' => $request->query('search')]);

        return $response->successful() ? $response->json() : ['venues' => []];
    })->name('search.venues');

    Route::post('/contacts/invite', [ContactInviteProxyController::class, 'store'])
        ->name('contacts.invite');

    Route::post('/tours', [TourController::class, 'store'])->name('tours.store');

    // VVV Supabase Chat Routes
    Route::prefix('api')->group(function () {
        Route::get('order-catalog-menu', OrderCatalogMenuController::class)->name('api.order-catalog-menu');
        Route::get('tours', TourIndexController::class)->name('api.tours.index');
        Route::get('tours/{tour}/orders', TourOrdersController::class)->name('api.tours.orders');
        Route::get('orders/{order}', OrderShowController::class)->name('api.orders.show');
        Route::post('orders/{order}/items', ApiOrderItemStoreController::class)->name('api.orders.items.store');
        Route::get('clients', ClientsIndexController::class)->name('api.clients.index');
        Route::get('staff', StaffIndexController::class)->name('api.staff.index');
        Route::patch('order-items/{orderItem}', OrderItemUpdateController::class)->name('api.order-items.update');
        Route::delete('order-items/{orderItem}', OrderItemDeleteController::class)->name('api.order-items.delete');
        Route::get('order-items/{orderItem}/assignees', OrderItemAssigneesIndexController::class)->name('api.order-items.assignees.index');
        Route::post('order-items/{orderItem}/assignees', OrderItemAssigneesSyncController::class)->name('api.order-items.assignees.sync');
        Route::delete('order-items/{orderItem}/assignees/{user}', OrderItemAssigneesDestroyController::class)->name('api.order-items.assignees.destroy');
        Route::patch('orders/{order}', OrderUpdateController::class)->name('api.orders.update');

        Route::patch('channels/{channelId}/messages/{id}', [ChannelMessageController::class, 'update']);
        Route::delete('channels/{channelId}/messages/{id}', [ChannelMessageController::class, 'destroy']);
    });
});

require __DIR__.'/settings.php';
