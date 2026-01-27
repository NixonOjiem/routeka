<?php

namespace App\Events;

use App\Models\ChatMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatMessageSent implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public $message;
    public $roomId;

    public function __construct(ChatMessage $message)
    {
        $this->message = $message;
        $this->roomId = $message->room->room_id;
    }

    // 👇 This is where you put your Channel definition
    public function broadcastOn()
    {
        // Public channel — no auth required
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
            'timestamp' => $this->message->created_at->toISOString(),
        ];
    }
}
