<?php

namespace App\Http\Controllers;

use App\Mail\GroupStatusNotification;
use App\Models\ChatRoom;
use App\Models\Group;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Log;

class GroupController extends Controller
{
    /**
     * Step 1: User submits a group creation request.
     * Status is 'pending' until approved by an admin.
     */
    public function requestGroup(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'requester_email' => 'required|email|max:255', // For notification purposes
        ]);

        $user = $request->user();

        $group = Group::create([
            'name' => $request->name,
            'description' => $request->description,
            'creator_id' => $user->id,
            'status' => 'pending', // Awaiting approval
        ]);

        // Trigger email notification to the application admin
        try {
            Mail::to(config('mail.from.address'))->send(new \App\Mail\GroupRequestNotification($group));
        } catch (\Exception $e) {
            // Log error but don't crash the request if mail server is down
            info("Failed sending group request email: " . $e->getMessage());
            return response()->json([
                'message' => 'Group creation request submitted successfully, but we failed to send the notification email to the admin. We will still review your request as normal.',
                'group' => $group
            ], 201);
        }

        return response()->json([
            'message' => 'Group creation request submitted successfully. It is currently pending admin approval.We will notify you via email once it has been reviewed.',
            'group' => $group
        ], 201);
    }

    /**
     * Step 2: Super Admin approves the group.
     * Automatically creates a ChatRoom and links it.
     */
    public function reviewGroup(Request $request, $id)
    {
        // Global Spatie Check: Only super-admins can process requests
        if (!$request->user()->hasRole('super-admin', 'api')) {
            return response()->json(['error' => 'Unauthorized. Only system administrators can review group requests.'], 403);
        }

        // Validate the incoming decision
        $request->validate([
            'status' => 'required|string|in:approved,rejected',
        ]);

        $group = Group::findOrFail($id);

        // Make sure we aren't reprocessing an already handled request
        if ($group->status !== 'pending') {
            return response()->json(['message' => 'This group request has already been processed.'], 400);
        }

        $decision = $request->status;

        // Handle Approval Logic
        if ($decision === 'approved') {
            $group->update(['status' => 'approved']);

            // Attach creator as local group-admin
            $group->members()->attach($group->creator_id, ['role' => 'group-admin']);

            // Generate the ChatRoom
            ChatRoom::create([
                'room_id' => 'room_' . Str::random(16),
                'group_id' => $group->id,
                'name' => $group->name,
                'ride_ids' => [],
                'user_ids' => [(int) $group->creator_id],
                'pickup_grid' => null,
                'dropoff_grid' => null,
                'is_active' => true
            ]);
        }
        // Handle Rejection Logic
        else {
            $group->update(['status' => 'rejected']);
        }

        // Notify the user of the decision dynamically using their account email
        try {
            Log::info("Attempting to send group status email to user: " . $group->creator->email);
            Log::info("Attempting to send group status email to user: ");
            Mail::to($group->creator->email)->send(new GroupStatusNotification($group));
        } catch (\Exception $e) {
            info("Failed sending group status email to user: " . $e->getMessage());
        }

        return response()->json([
            'message' => "Group request has been successfully {$decision}.",
            'group' => $group->load('chatRoom')
        ], 200);
    }

    /**
     * Update group details.
     * Accessible by Super Admins OR local Group Admins.
     */
    public function updateGroup(Request $request, $id)
    {
        $group = Group::findOrFail($id);
        $user = $request->user();

        // Check permission inline
        $isSuperAdmin = $user->hasRole('super-admin', 'api');
        $isLocalAdmin = $group->members()->where('user_id', $user->id)->wherePivot('role', 'group-admin')->exists();

        if (!$isSuperAdmin && !$isLocalAdmin && $group->creator_id !== $user->id) {
            return response()->json(['error' => 'You do not have management permissions for this group.'], 403);
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $group->update($request->only(['name', 'description']));

        // Synchronize ChatRoom name if it changed
        if ($request->has('name') && $group->chatRoom) {
            $group->chatRoom->update(['name' => $request->name]);
        }

        return response()->json(['message' => 'Group updated successfully.', 'group' => $group]);
    }

    /**
     * Delete a group entirely.
     * Restricted to Super Admin or the Group Creator.
     */
    public function deleteGroup(Request $request, $id)
    {
        $group = Group::findOrFail($id);
        $user = $request->user();

        $isSuperAdmin = $user->hasRole('super-admin', 'api');

        if (!$isSuperAdmin && $group->creator_id !== $user->id) {
            return response()->json(['error' => 'Only the group creator or system super-admin can dissolve a group.'], 403);
        }

        // Deleting the group triggers cascadeOnDelete across pivot table mappings and the chat room
        $group->delete();

        return response()->json(['message' => 'Group dissolved successfully.']);
    }

    /**
     * Add a member to a group.
     * Updates pivot table AND syncs the ChatRoom user_ids array.
     */
    public function addGroupMember(Request $request, $id)
    {
        $group = Group::findOrFail($id);
        $user = $request->user();

        // Local authorization check
        $isSuperAdmin = $user->hasRole('super-admin', 'api');
        $isLocalAdmin = $group->members()->where('user_id', $user->id)->wherePivot('role', 'group-admin')->exists();

        if (!$isSuperAdmin && !$isLocalAdmin) {
            return response()->json(['error' => 'Only group admins can add new members.'], 403);
        }

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'nullable|string|in:member,group-admin' // Allows adding directly or promoting directly
        ]);

        $targetUserId = $request->user_id;
        $targetRole = $request->input('role', 'member');

        // Prevent duplicate structural inserts
        if ($group->members()->where('user_id', $targetUserId)->exists()) {
            return response()->json(['message' => 'User is already a member of this group.'], 422);
        }

        // 1. Attach to pivot table
        $group->members()->attach($targetUserId, ['role' => $targetRole]);

        // 2. Synchronize ChatRoom tracking array
        if ($group->chatRoom) {
            $chatRoom = $group->chatRoom;
            $currentUsers = $chatRoom->user_ids ?? [];

            if (!in_array($targetUserId, $currentUsers)) {
                $currentUsers[] = (int) $targetUserId;
                $chatRoom->update(['user_ids' => $currentUsers]);
            }
        }

        return response()->json(['message' => 'Member added successfully to group and chat room.']);
    }

    /**
     * Remove a member from a group.
     * Updates pivot table AND syncs the ChatRoom user_ids array.
     */
    public function removegroupMember(Request $request, $id, $userId)
    {
        $group = Group::findOrFail($id);
        $user = $request->user();

        $isSuperAdmin = $user->hasRole('super-admin', 'api');
        $isLocalAdmin = $group->members()->where('user_id', $user->id)->wherePivot('role', 'group-admin')->exists();

        if (!$isSuperAdmin && !$isLocalAdmin) {
            return response()->json(['error' => 'Only group admins can remove members.'], 403);
        }

        if ($group->creator_id == $userId) {
            return response()->json(['error' => 'The original group creator cannot be removed from the group.'], 422);
        }

        // 1. Detach from pivot table
        $group->members()->detach($userId);

        // 2. Remove from ChatRoom array tracking
        if ($group->chatRoom) {
            $chatRoom = $group->chatRoom;
            $currentUsers = $chatRoom->user_ids ?? [];

            // Filter out target user ID
            $updatedUsers = array_values(array_filter($currentUsers, function ($id) use ($userId) {
                return $id != $userId;
            }));

            $chatRoom->update(['user_ids' => $updatedUsers]);
        }

        return response()->json(['message' => 'Member removed successfully from group and chat room.']);
    }
}
