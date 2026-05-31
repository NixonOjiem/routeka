<?php

namespace App\Mail;

use App\Models\Group;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class GroupRequestNotification extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * The group instance.
     * By setting this to public, it is automatically available in the view.
     */
    public Group $group;

    /**
     * Create a new message instance.
     */
    public function __construct(Group $group)
    {
        // Load the creator relationship if it isn't already loaded
        $this->group = $group->relationLoaded('creator') ? $group : $group->load('creator');
    }

    /**
     * Get the message envelope (Subject, From, etc.).
     */
    public function getEnvelope(): Envelope
    {
        return new Envelope(
            subject: '🚨 New Group Creation Request: ' . $this->group->name,
        );
    }

    /**
     * Get the message content definition.
     */
    public function getContent(): Content
    {
        return new Content(
            markdown: 'emails.group_request',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
