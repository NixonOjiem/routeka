<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class group extends Model
{
    //
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'creator_id',
        'status', // pending approved or rejected
    ];

    //Group creator
    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    //group members
    public function members()
    {
        return $this->belongsToMany(User::class, 'group_user')->withTimestamps();
    }

    //group has one chat room
    public function chatRoom()
    {
        return $this->hasOne(ChatRoom::class);
    }

}
