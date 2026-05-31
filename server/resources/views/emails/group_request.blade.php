@component('mail::message')
# New Group Approval Required

Hello Admin,

A new user group has been requested and is currently awaiting your approval. Here are the submission details:

@component('mail::panel')
**Group Name:** {{ $this->group->name }}
**Requested By:** {{ $this->group->creator->name }} ({{ $this->group->creator->email }})
**Description:** {{ $this->group->description ?? 'No description provided.' }}
@endcomponent

To review, approve, or reject this request, please click the button below to visit your administration dashboard.

@component('mail::button', ['url' => env('FRONTEND_URL') . '/admin/groups/' . $this->group->id])
Review Group Request
@endcomponent

Thanks,<br>
{{ config('app.name') }}
@endcomponent
