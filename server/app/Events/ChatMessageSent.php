<?php

namespace App\Events;

use App\Models\ChatMessage;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatMessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;
    public $message; public $roomId;
    public function __construct(ChatMessage $message)
    { $this->message = $message; $this->roomId = $message->room->room_id; }
    public function broadcastOn() {
        // ✅ PresenceChannel works with Reverb just like Pusher
        return new PresenceChannel('chat.' . $this->roomId); }
        public function broadcastAs()
        { // ✅ Optional: give the event a custom name
        return 'message.sent'; }
        public function broadcastWith() {
            return [ 'id' => $this->message->id,
            'sender_name' => $this->message->sender_name,
            'message' => $this->message->message,
            'type' => $this->message->message_type,
            'timestamp' => $this->message->created_at->toISOString(),
             ];
            }
        }
