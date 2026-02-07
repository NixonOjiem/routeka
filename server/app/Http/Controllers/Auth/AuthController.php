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
    public function googleAuthentication(Request $request)
    {
        try {
            // 1. Get the 'token' sent from React
            $token = $request->input('token');

            if (!$token) {
                return response()->json(['error' => 'Token is required'], );
            }

            // 2. Verify the token with Google using Socialite 'stateless'
            // 'stateless()' is crucial for APIs as we don't use sessions
            $googleUser = Socialite::driver('google')->stateless()->userFromToken($token);

            // 3. Find user by google_id or email
            $user = User::where('google_id', $googleUser->getId())
                ->orWhere('email', $googleUser->getEmail())
                ->first();

            if ($user) {
                // If user exists but doesn't have google_id yet (registered via email previously), link them
                if (!$user->google_id) {
                    $user->update([
                        'google_id' => $googleUser->getId(),
                        'avatar' => $googleUser->getAvatar(),
                    ]);
                }
            } else {
                // 4. Create new user
                // Generate a unique user_name based on their name or email
                $baseUsername = Str::slug($googleUser->getName());
                $username = $baseUsername . rand(1000, 9999);

                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'user_name' => $username, // Mandatory field in your DB
                    'avatar' => $googleUser->getAvatar(),
                    'password' => null, // Or bcrypt(Str::random(16)) if password cannot be null
                    'email_verified_at' => now(), // Google emails are verified
                ]);
            }

            // 5. Login the user and generate a token
            // Assuming you use Passport or Sanctum.
            // Adjust the token creation line based on your specific setup.

            // Example for Sanctum/Passport:
            $tokenResult = $user->createToken('GoogleAuthToken')->accessToken;
            // Note: If using Sanctum, it is ->plainTextToken instead of ->accessToken

            return response()->json([
                'status' => 'success',
                'message' => 'User logged in successfully',
                'user' => $user,
                'token' => $tokenResult,
            ]);

        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Google Authentication Failed',
                'error' => $e->getMessage()
            ], 401);
        }
    }
}
