<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Auth\Events\Verified;

class VerificationController extends Controller
{
    public function verify($id, Request $request)
    {
        if (!$request->hasValidSignature()) {
            return response()->json(['msg' => 'Invalid/Expired URL provided.'], 401);
        }

        $user = User::find($id);

        if (!$user) {
            return response()->json(['msg' => 'Invalid user.'], 401);
        }

        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }

        return response()->json(['msg' => 'Email verified successfully.']);
    }

    public function resend(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['msg' => 'Email already verified.'], 400);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json(['msg' => 'Email verification link sent on your email id']);
    }
}
