<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Auth\VerificationController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\PersonaWebHookController;
use App\Http\Controllers\UpdatedRideRequestController;
// use App\Http\Controllers\RideRequestController;
// use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

//Auth routes
Route::group(['prefix' => 'auth'], function () {
    //Registration and login routes accessible to guests
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:api');
    // Social login route
    Route::post('google-auth', [AuthController::class, 'googleAuthentication']);
    // Password reset routes
    Route::post('forgot-password', [PasswordResetController::class, 'sendResetLink']);
    Route::post('reset-password', [PasswordResetController::class, 'reset']);
    // Profile routes (requires authentication)
    Route::get('me', [AuthController::class, 'me'])->middleware('auth:api');
    Route::get('profile', [AuthController::class, 'profile'])->middleware('auth:api');
    Route::patch('profile-update', [AuthController::class, 'updateProfileDetails'])->middleware('auth:api');
});

// Email Verification Routes
// 1. Verify Email (Does not require login, uses signed URL)
Route::get('email/verify/{id}', [VerificationController::class, 'verify'])->name('verification.verify');

Route::get('/test', function () {
    return "server working";
});

// 2. Resend Email (Requires user to be logged in with token)
Route::group(['middleware' => 'auth:api'], function () {
    Route::get('email/resend', [VerificationController::class, 'resend'])->name('verification.resend');
});


Route::group(['prefix' => 'rides'], function () {
    // Route::post('request', [RideRequestController::class, 'store']);
    // Route::get('groups', [RideRequestController::class, 'index']);
    Route::post('v1/request', [UpdatedRideRequestController::class, 'store']);
    Route::get('v1/groups', [UpdatedRideRequestController::class, 'index']);
});

// Chat routes (accessible to both guests and users)
Route::prefix('chat')->group(function () {
    Route::get('/rooms', [ChatController::class, 'getChatRooms']);
    Route::get('/rooms/{roomId}/join', [ChatController::class, 'joinRoom']);
    Route::get('/rooms/{roomId}/messages', [ChatController::class, 'getMessages']);
    Route::post('/rooms/{roomId}/messages', [ChatController::class, 'sendMessage']);
});

// Optional: WebSocket/Pusher event broadcasting
Route::post('/chat/broadcast', [ChatController::class, 'broadcastMessage']);

Route::post('/webhooks/persona', [PersonaWebHookController::class, 'handle']);
