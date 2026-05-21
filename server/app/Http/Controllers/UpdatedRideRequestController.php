<?php

namespace App\Http\Controllers;

use App\Models\RideRequest;
use App\Services\UpdatedRideMatchingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Jobs\getAreaNamesForNewlySubmitedRequest;

class UpdatedRideRequestController extends Controller
{
    //
    protected $rideService;

    //public function __construct(RideMatchingService $rideService)
    public function __construct(UpdatedRideMatchingService $rideService)
    {
        $this->rideService = $rideService;
    }

    //fetch Grouped Data (For Admin or "My Matches" view)
    public function index(Request $request)
    {
        try {
            // $groupedRides = $this->rideService->getGroupedRides();

            // Check if user is logged in via JWT
            $user = Auth::guard('api')->user();

            // Get Guest ID from Header (sent by interceptor)
            $guestId = $request->header('X-Guest-ID');
            Log::info('Detected guest ID from index function: ' . $guestId);

            // Fetch the categorized rides passing the user ID and guest ID
            $userId = $user ? $user->id : null;
            $segmentedData = $this->rideService->getSegmentedRides($userId, $guestId);

            $chatRooms = $this->rideService->getAvailableChatRooms($userId);

            return response()->json([
                'success' => true,
                'matched_rides' => $segmentedData['matched_rides'], // User's matched groups (>1 member)
                'pending_rides' => $segmentedData['pending_rides'], // User's unmatched requests (1 member)
                'popular_rides' => $segmentedData['popular_rides'], // Any groups with >= 3 members
                'chat_rooms' => $chatRooms,
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name
                ] : null,
                'detected_guest_id' => $guestId
            ]);

        } catch (\Exception $e) {
            Log::error('Error in RideRequestController index: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to load ride groups'
            ], 500);
        }
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

        // 5. Dispatch the job to fetch area names
        getAreaNamesForNewlySubmitedRequest::dispatch($ride);

        return response()->json([
            'message' => 'Ride request submitted successfully',
            //'data' => $ride
        ], 201);
    }

    public function deleteRideRequest(Request $request)
    {
        Log::info($request->all());
        $validated = $request->validate([
            'request_id' => 'required|exists:ride_requests,id',
        ]);

        $user = Auth::guard('api')->user();
        Log::info('User data:', $user->toArray());
        $deletedCount = RideRequest::where('id', $validated['request_id'])
            ->where('user_id', $user->id)
            ->delete();

        //Handle the response
        if ($deletedCount) {
            return response()->json([
                'message' => 'Your ride request has been deleted.'
            ], 200);
        }

        return response()->json([
            'message' => 'You are not authorized to delete this request, or it does not exist.'
        ], 403);
    }

}
