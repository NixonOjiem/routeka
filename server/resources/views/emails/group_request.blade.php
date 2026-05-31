@component('mail::message')
# New Group Approval Required

Hello Admin,

A new user group has been requested and is currently awaiting your approval. Here are the submission details:

@component('mail::panel')
**Group Name:** {{ $group->name }}
**Requested By:** {{ $group->creator->name }} ({{ $group->creator->email }})
**Description:** {{ $group->description ?? 'No description provided.' }}
@endcomponent

To review, approve, or reject this request, please click the button below to visit your administration dashboard.

@component('mail::button', ['url' => env('FRONTEND_URL') . '/admin/groups/' . $group->id])
Review Group Request
@endcomponent

Thanks,<br>
{{ config('app.name') }}
@endcomponent
