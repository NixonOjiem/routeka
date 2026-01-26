<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatRoom extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_id',
        'name',
        'ride_ids',
        'user_ids',
        'pickup_grid',
        'dropoff_grid',
        'is_active'
    ];

    protected $casts = [
        'ride_ids' => 'array',
        'user_ids' => 'array',
    ];

    public function messages()
    {
        return $this->hasMany(ChatMessage::class)->latest();
    }

    public function rideRequests()
    {
        return $this->belongsToMany(RideRequest::class, 'chat_room_ride_request');
    }
}
