@component('mail::message')
# Hello {{ $this->group->creator->name }},

We have reviewed your request to create the group **{{ $this->group->name }}**.

@if($this->group->status === 'approved')
    ## 🎉 Your Group Has Been Approved!
    You have been automatically designated as the **Group Admin**. Your dedicated group chat room is now fully set up and
    ready for use.

    @component('mail::button', ['url' => env('FRONTEND_URL') . '/dashboard/groups/' . $this->group->id])
    Go To Your Group
    @endcomponent

@else
    ## ⚠️ Your Group Request Was Not Approved
    Unfortunately, your request to create this group was declined at this time. If you feel this was a mistake or wish to
    alter your configuration parameters, please feel free to reach out to system support or try again.
@endif

Thank you for being part of our community,<br>
{{ config('app.name') }}
@endcomponent
