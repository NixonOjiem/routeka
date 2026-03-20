<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PersonaWebHookController extends Controller
{
    public function handle(Request $request)
    {
        // 1. Extract the event type and data
        $payload = $request->input('data');
        $attributes = $payload['attributes'] ?? [];
        $eventType = $payload['type'] ?? ''; // e.g., "inquiry.completed"

        // 2. Log for debugging (standard dev practice)
        Log::info("Persona Webhook Received: {$eventType}", ['payload' => $request->all()]);

        // 3. Handle the completion event
        if ($payload['type'] === 'inquiry') {
            $status = $attributes['status'] ?? '';
            $referenceId = $attributes['reference_id'] ?? null; // This is your User ID

            if ($status === 'completed' && $referenceId) {
                $user = User::find($referenceId);
                if ($user) {
                    $user->update([
                        'verification_status' => 'completed',
                        'persona_inquiry_id' => $payload['id']
                    ]);
                }
            }
        }

        return response()->json(['message' => 'Webhook processed'], 200);
    }
}
