<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\RideRequestController;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

//Auth routes
Route::group(['prefix' => 'auth'], function(){
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::get('me', [AuthController::class, 'me'])->middleware('auth:api');
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:api');
});


Route::group(['prefix' => 'rides'], function(){
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
