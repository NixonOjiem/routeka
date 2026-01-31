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
            #return response()->json(['msg' => 'Invalid/Expired URL provided.'], 401);
            return redirect(env('FRONTEND_URL') . '/auth?error=invalid_link');
        }

        $user = User::find($id);

        if (!$user) {
            # return response()->json(['msg' => 'Invalid user.'], 401);
            return redirect(env('FRONTEND_URL') . '/auth?error=invalid_user');
        }

        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }

        #return response()->json(['msg' => 'Email verified successfully.']);
        # SUCCESS: Redirect to React Login page with a query param
    return redirect(env('FRONTEND_URL') . '/auth?verified=true');
    }

    public function resend(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            # return response()->json(['msg' => 'Email already verified.'], 400);
            return redirect(env('FRONTEND_URL'). '/auth?verified=true');
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json(['msg' => 'Email verification link sent on your email id']);
    }
}
