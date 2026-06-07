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

    public Group $group;

    public function __construct(Group $group)
    {
        $this->group = $group->relationLoaded('creator')
            ? $group
            : $group->load('creator');
    }

    // ✅ MUST be envelope()
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '🚨 New Group Creation Request: ' . $this->group->name,
        );
    }

    // ✅ MUST be content()
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.group_request',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
