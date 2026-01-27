<?php

namespace App\Http\Controllers;

use App\Models\ChatRoom;
use App\Models\ChatMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ChatController extends Controller
{
    /**
     * Get chat rooms for a user
     */
    public function getChatRooms(Request $request)
    {
        $userId = $request->user() ? $request->user()->id : null;
        $guestId = $request->header('X-Guest-ID', Str::random(10));

        $rooms = ChatRoom::where('is_active', true)
            ->withCount('messages')
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function($room) use ($userId) {
                // Check if user is in this room
                $isMember = $userId ? in_array($userId, $room->user_ids ?? []) : false;

                return [
                    'room_id' => $room->room_id,
                    'name' => $room->name,
                    'is_member' => $isMember,
                    'pickup_grid' => $room->pickup_grid,
                    'dropoff_grid' => $room->dropoff_grid,
                    'member_count' => count($room->ride_ids),
                    'message_count' => $room->messages_count,
                    'last_activity' => $room->updated_at
                ];
            });

        return response()->json([
            'rooms' => $rooms,
            'guest_id' => $guestId
        ]);
    }

    /**
     * Get messages for a specific chat room
     */
    // public function getMessages($roomId, Request $request)
    // {
    //     $room = ChatRoom::where('room_id', $roomId)->firstOrFail();

    //     // Check access
    //     if ($request->user()) {
    //         $user = $request->user();
    //         if (!in_array($user->id, $room->user_ids ?? [])) {
    //             return response()->json(['error' => 'Not a member of this chat room'], 403);
    //         }
    //         $guestId = null;
    //         $senderName = $user->name;
    //     } else {
    //         $guestId = $request->header('X-Guest-ID');
    //         if (!$guestId) {
    //             return response()->json(['error' => 'Guest ID required'], 400);
    //         }
    //         $senderName = 'Guest_' . substr($guestId, 0, 6);
    //     }

    //     $messages = ChatMessage::where('chat_room_id', $room->id)
    //         ->orderBy('created_at', 'desc')
    //         ->limit(50)
    //         ->get()
    //         ->map(function($message) {
    //             return [
    //                 'id' => $message->id,
    //                 'sender_name' => $message->sender_name,
    //                 'message' => $message->message,
    //                 'type' => $message->message_type,
    //                 'is_guest' => $message->user_id === null,
    //                 'timestamp' => $message->created_at->toISOString()
    //             ];
    //         });

    //     return response()->json([
    //         'room' => [
    //             'id' => $room->room_id,
    //             'name' => $room->name,
    //             'member_count' => count($room->ride_ids)
    //         ],
    //         'messages' => $messages,
    //         'sender_name' => $senderName
    //     ]);
    // }
    public function getMessages($roomId, Request $request)
{
    $room = ChatRoom::where('room_id', $roomId)->firstOrFail();

    // Check access
    if ($request->user()) {
        $user = $request->user();
        if (!in_array($user->id, $room->user_ids ?? [])) {
            return response()->json(['error' => 'Not a member of this chat room'], 403);
        }
        $guestId = null;
        $senderName = $user->name;
    } else {
        $guestId = $request->header('X-Guest-ID');
        if (!$guestId) {
            return response()->json(['error' => 'Guest ID required'], 400);
        }
        $senderName = 'Guest_' . substr($guestId, 0, 6);
    }

    // Change from 'desc' to 'asc' - this puts oldest first
    $messages = ChatMessage::where('chat_room_id', $room->id)
        ->orderBy('created_at', 'asc') // Changed from 'desc' to 'asc'
        ->limit(50)
        ->get()
        ->map(function($message) {
            return [
                'id' => $message->id,
                'sender_name' => $message->sender_name,
                'message' => $message->message,
                'type' => $message->message_type,
                'is_guest' => $message->user_id === null,
                'timestamp' => $message->created_at->toISOString()
            ];
        });

    return response()->json([
        'room' => [
            'id' => $room->room_id,
            'name' => $room->name,
            'member_count' => count($room->ride_ids)
        ],
        'messages' => $messages,
        'sender_name' => $senderName
    ]);
}

    /**
     * Send a message to a chat room
     */
    public function sendMessage($roomId, Request $request)
    {
        $validator = Validator::make($request->all(), [
            'message' => 'required|string|max:1000',
            'type' => 'sometimes|in:text,image,location'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $room = ChatRoom::where('room_id', $roomId)->firstOrFail();

        // Determine sender info
        if ($request->user()) {
            $user = $request->user();
            $userId = $user->id;
            $guestId = null;
            $senderName = $user->name;

            // Ensure user is in the room
            if (!in_array($userId, $room->user_ids ?? [])) {
                return response()->json(['error' => 'Not a member of this chat room'], 403);
            }
        } else {
            $userId = null;
            $guestId = $request->header('X-Guest-ID');
            if (!$guestId) {
                $guestId = Str::random(10);
            }
            $senderName = 'Guest_' . substr($guestId, 0, 6);
        }

        // Create message
        $message = ChatMessage::create([
            'chat_room_id' => $room->id,
            'user_id' => $userId,
            'guest_id' => $guestId,
            'sender_name' => $senderName,
            'message' => $request->message,
            'message_type' => $request->type ?? 'text'
        ]);

        // Update room's timestamp
        $room->touch();

        // Broadcast message (for real-time)
        // event(new ChatMessageSent($message));

        return response()->json([
            'success' => true,
            'message' => [
                'id' => $message->id,
                'sender_name' => $message->sender_name,
                'message' => $message->message,
                'timestamp' => $message->created_at->toISOString()
            ],
            'guest_id' => $guestId
        ]);
    }

    /**
     * Join a chat room
     */
    public function joinRoom($roomId, Request $request)
    {
        $room = ChatRoom::where('room_id', $roomId)->firstOrFail();

        if ($request->user()) {
            $user = $request->user();
            $userIds = $room->user_ids ?? [];

            if (!in_array($user->id, $userIds)) {
                $userIds[] = $user->id;
                $room->update(['user_ids' => array_unique($userIds)]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Joined room successfully',
                'room' => [
                    'id' => $room->room_id,
                    'name' => $room->name,
                    'is_member' => true
                ]
            ]);
        } else {
            // Guest can always view public rooms
            $guestId = $request->header('X-Guest-ID', Str::random(10));

            return response()->json([
                'success' => true,
                'message' => 'Guest access granted',
                'guest_id' => $guestId,
                'room' => [
                    'id' => $room->room_id,
                    'name' => $room->name,
                    'is_member' => true
                ]
            ]);
        }
    }
}
