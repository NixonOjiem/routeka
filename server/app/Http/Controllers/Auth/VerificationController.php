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
            # return redirect(env('FRONTEND_URL') . '/auth?error=invalid_link', 401);
            return redirect(env('FRONTEND_URL') . '/auth?error=invalid_link');
            // By default, this uses 302, which is what browsers need to actually move.
        }

        $user = User::find($id);

        if (!$user) {
            return redirect(env('FRONTEND_URL') . '/auth?error=invalid_user', );
        }

        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            if (!$user->hasRole('user', 'api')) {
                $user->assignRole('user');
            }
            event(new Verified($user));
        }

        return redirect(env('FRONTEND_URL') . '/auth?verified=true');
    }

    public function resend(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect(env('FRONTEND_URL') . '/auth?verified=true', );
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json(['msg' => 'Email verification link sent on your email id']);
    }
}
