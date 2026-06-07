<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
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
        return $this->belongsToMany(User::class, 'group_user')->withPivot('role')->withTimestamps();
    }

    //group has one chat room
    public function chatRoom()
    {
        return $this->hasOne(ChatRoom::class);
    }


    //* Helper to get only the administrators of this specific group.

    public function groupAdmins()
    {
        return $this->members()->wherePivot('role', 'group-admin');
    }

}
