<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\RideRequestController;
use App\Http\Controllers\Auth\VerificationController;

//Auth routes
Route::group(['prefix' => 'auth'], function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('google-auth', [AuthController::class, 'googleAuthentication']);
    Route::get('me', [AuthController::class, 'me'])->middleware('auth:api');
    Route::get('profile', [AuthController::class, 'profile'])->middleware('auth:api');
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:api');
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
    Route::post('request', [RideRequestController::class, 'store']);
    Route::get('groups', [RideRequestController::class, 'index']);
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
