<?php

namespace App\Http\Controllers;

use App\Models\RideRequest;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Services\RideMatchingService;
use Tymon\JWTAuth\Exceptions\JWTException;
use Illuminate\Validation\ValidationException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;


class UpdatedRideRequestController extends Controller
{
    //
    protected $rideService;

    public function __construct(RideMatchingService $rideService)
    {
        $this->rideService = $rideService;
    }

    // store data in database
    public function store(Request $request)
    {
        Log::info("Received ride request submission:", ['request_data' => $request->all()]);
        try {
            // 1. Authenticate the user via JWT
            $user = JWTAuth::parseToken()->authenticate();

            // 2. Check if the user is verified
            if (!$user->hasVerifiedEmail()) {
                return response()->json([
                    'message' => 'Your email address is not verified.',
                    'error' => 'email_unverified'
                ], 403);
            }

        } catch (TokenExpiredException $e) {
            return response()->json(['message' => 'Token expired', 'error' => 'token_expired'], 401);
        } catch (TokenInvalidException $e) {
            return response()->json(['message' => 'Token invalid', 'error' => 'token_invalid'], 401);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Authorization error'], 401);
        }

        Log::info("Authenticated user for ride request:", ['user_id' => $user->id, 'email' => $user->email]);

        // 3. Validation (category is now optional)
        $validated = $request->validate([
            'pickup.lat' => 'required|numeric',
            'pickup.lng' => 'required|numeric',
            'dropoff.lat' => 'required|numeric',
            'dropoff.lng' => 'required|numeric',
            'commute_time' => 'required|date',
            'frequency' => 'required|string',
            'category' => 'nullable|string',
        ]);
        Log::info("Received ride request data:", $validated);

        // 4. Prepare data for saving
        $data = [
            'user_id' => $user->id,
            'pickup_lat' => $validated['pickup']['lat'],
            'pickup_lng' => $validated['pickup']['lng'],
            'dropoff_lat' => $validated['dropoff']['lat'],
            'dropoff_lng' => $validated['dropoff']['lng'],
            'commute_time' => $validated['commute_time'],
            'frequency' => $validated['frequency'],
            'category' => $validated['category'] ?? null, // optional now
            'status' => 'pending',
        ];
        Log::info("Prepared ride request data for saving:", $data);

        $ride = RideRequest::create($data);
        log::info("Stored ride request in database:", $ride->toArray());

        return response()->json([
            'message' => 'Ride request submitted successfully',
            'data' => $ride
        ], 201);
    }



}
