<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Validator;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;
use Exception;

class AuthController extends Controller
{
    // Register
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'user_name' => 'required|string|max:100'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'user_name' => $request->user_name,
        ]);

        // trigger event to send email

        event(new Registered($user));
        return response()->json(['message' => 'Registration successful. Please verify your email before logging in.'], 201);
    }

    // Login
    public function login()
    {
        // 1. Get the login input (can be email or username) and password
        $loginData = request()->input('login');
        $password = request()->input('password');

        // 2. Determine if the input is an email or a username
        $loginField = filter_var($loginData, FILTER_VALIDATE_EMAIL) ? 'email' : 'user_name';

        // 3. Merge the specific field into the credentials
        $credentials = [
            $loginField => $loginData,
            'password' => $password,
        ];

        // 4. Attempt login
        if (!$token = auth('api')->attempt($credentials)) {
            return response()->json(['message' => 'Unauthorized. Check your credentials.'], 401);
        }

        $user = auth('api')->user();

        // 5. Check Email Verification
        if (!$user->hasVerifiedEmail()) {
            auth('api')->logout();
            return response()->json(['message' => 'Please verify your email before logging in.'], 403);
        }

        return $this->respondWithToken($token, $user, $user->user_name);
    }

    // Get Authenticated User
    public function me()
    {
        if (!auth('api')->check()) {
            return response()->json(['message' => 'Please login to continue'], 401);
        }
        return response()->json(auth('api')->user());
    }

    public function profile()
    {
        if (!auth('api')->check()) {
            return response()->json(['message' => 'Please login to continue'], 401);
        }

        $user = auth('api')->user();
        $userData = [
            'name' => $user->name,
            'email' => $user->email,
            'user_name' => $user->user_name,
            'email_verified_at' => $user->email_verified_at
        ];
        Log::info($userData);
        return response()->json(['message' => 'Profile retrieved successfully', 'data' => $userData]);
    }
    // Log the user out (Invalidate the token)
    public function logout()
    {
        auth('api')->logout();
        return response()->json(['message' => 'Successfully logged out']);
    }

    // Helper function to format the response
    protected function respondWithToken($token, $user, $user_name)
    {
        return response()->json([
            'token' => $token,
            'user' => $user,
            'user_name' => $user_name,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60
        ]);
    }
    // Google Authentication
    public function googleAuthentication(Request $request)
    {
        try {
            $token = $request->input('token');

            if (!$token) {
                return response()->json(['error' => 'Token is required'], 400);
            }

            $googleUser = Socialite::driver('google')->stateless()->userFromToken($token);

            // Find user by google_id or email
            $user = User::where('google_id', $googleUser->getId())
                ->orWhere('email', $googleUser->getEmail())
                ->first();

            if ($user) {
                // 1. Link Google ID if it's missing (e.g. they registered via email/password first)
                if (!$user->google_id) {
                    $user->update([
                        'google_id' => $googleUser->getId(),
                        'avatar' => $googleUser->getAvatar(),
                    ]);
                }

                // 2. CRITICAL FIX: Check if email is unverified and verify it.
                // Since they logged in with Google, we trust the email is verified.
                if (!$user->hasVerifiedEmail()) {
                    $user->markEmailAsVerified();
                    // Or manually: $user->update(['email_verified_at' => now()]);
                }

            } else {
                // Create new user
                $baseUsername = Str::slug($googleUser->getName());
                $username = $baseUsername;
                $counter = 1;

                while (User::where('user_name', $username)->exists()) {
                    $username = $baseUsername . $counter;
                    $counter++;
                }

                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'user_name' => $username,
                    'avatar' => $googleUser->getAvatar(),
                    // Ensure you provide a password if your DB column is not nullable,
                    // or make the password column nullable in migration.
                    'password' => Hash::make(Str::random(16)),
                    'email_verified_at' => now(), // Set verified immediately
                ]);
            }

            $token = auth('api')->login($user);

            return $this->respondWithToken($token, $user, $user->user_name);

        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Google Authentication Failed',
                'error' => $e->getMessage()
            ], 401);
        }
    }
    public function updateProfileDetails(Request $request)
    {
        // 1. Get the authenticated user

        $user = auth('api')->user();
        Log::info("Authenticated user in update profile: " . $user->id);

        // 2. Define Validation Rules
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $user->id,
            'user_name' => 'sometimes|required|string|max:100|unique:users,user_name,' . $user->id,
            'password' => 'sometimes|required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        log::info("Validation passed for update profile: " . json_encode($validator->validated()));

        // 3. Prepare data for update
        // We filter the request to only include the validated fields
        $data = $validator->validated();

        // 4. Handle Password Hashing specifically
        // We check if password exists in the validated data array
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        // 5. Update the user
        // fill() updates the model instance with the array data but doesn't save yet.
        // This handles the "partial" update logic automatically.
        $user->fill($data);

        // 6. Save changes
        $user->save();
        log::info("User profile updated successfully for user ID: " . $user->id);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ], 200);
    }

}
