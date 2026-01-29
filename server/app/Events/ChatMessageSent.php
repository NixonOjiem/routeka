<?php

namespace App\Events;

use App\Models\ChatMessage;
use App\Models\ChatRoom;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatMessageSent implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public $message;
    public $roomId;

    public function __construct(ChatMessage $message, $roomId = null)
    {
        $this->message = $message;
        // Use the provided roomId or fetch it if not provided
        $this->roomId = $roomId ?? $this->getRoomIdFromMessage($message);
    }

    // Helper method to get room ID safely
    private function getRoomIdFromMessage(ChatMessage $message)
    {
        // Load room relationship if not already loaded
        if (!$message->relationLoaded('room')) {
            $message->load('room');
        }

        // Check if room exists and has room_id
        if ($message->room && $message->room->room_id) {
            return $message->room->room_id;
        }

        // Fallback: query the room directly
        $room = ChatRoom::find($message->chat_room_id);
        return $room ? $room->room_id : 'unknown';
    }

    public function broadcastOn()
    {
        return new Channel('chat.' . $this->roomId);
    }

    public function broadcastAs()
    {
        return 'message.sent';
    }

    public function broadcastWith()
    {
        return [
            'id' => $this->message->id,
            'sender_name' => $this->message->sender_name,
            'message' => $this->message->message,
            'type' => $this->message->message_type,
            'is_guest' => $this->message->user_id === null,
            'user_id' => $this->message->user_id,
        'guest_id' => $this->message->guest_id,
        'timestamp' => $this->message->created_at->toISOString(),
        ];
    }
}
