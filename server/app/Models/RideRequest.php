<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RideRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'guest_name',
        'guest_email',
        'guest_phone',
        'pickup_lat',
        'pickup_lng',
        'dropoff_lat',
        'dropoff_lng',
        'commute_time',
        'frequency',
        'status',
        'guest_id',
        'category',
        'category_metadata',
        'pickup_name',
        'dropoff_name',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
