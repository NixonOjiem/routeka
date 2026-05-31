<?php

namespace App\Mail;

use App\Models\Group;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class GroupStatusNotification extends Mailable
{
    use Queueable, SerializesModels;

    public Group $group;

    public function __construct(Group $group)
    {
        $this->group = $group->relationLoaded('creator') ? $group : $group->load('creator');
    }

    public function envelope(): Envelope
    {
        $statusText = ucfirst($this->group->status);
        return new Envelope(
            subject: "Update: Your Group Request '{$this->group->name}' has been {$statusText}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.group_status',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
