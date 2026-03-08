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

class RideRequestController extends Controller
{
    protected $rideService;

    public function __construct(RideMatchingService $rideService)
    {
        $this->rideService = $rideService;
    }

    // 2. Fetch Grouped Data (For Admin or "My Matches" view)

    public function index(Request $request)
    {
        try {
            $groupedRides = $this->rideService->getGroupedRides();

            // Check if user is logged in via JWT
            $user = Auth::guard('api')->user();

            // Get Guest ID from Header (sent by interceptor)
            $guestId = $request->header('X-Guest-ID');
            Log::info('Detected guest ID from index function: ' . $guestId);

            $chatRooms = $this->rideService->getAvailableChatRooms(
                $user ? $user->id : null
            );

            return response()->json([
                'success' => true,
                'groups' => $groupedRides,
                'chat_rooms' => $chatRooms,
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name
                ] : null,
                // Return the detected guest ID to help frontend matching
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

    /**
     * Get rides grouped by grid
     */
    public function getGriddedRides(Request $request)
    {
        $gridSize = $request->input('grid_size', 0.0145); // ~1 mile

        $rides = RideRequest::where('status', 'pending')
            ->with('user')
            ->get()
            ->groupBy(function ($ride) use ($gridSize) {
                $pickupGrid = $this->calculateGrid(
                    $ride->pickup_lat,
                    $ride->pickup_lng,
                    $gridSize
                );
                $dropoffGrid = $this->calculateGrid(
                    $ride->dropoff_lat,
                    $ride->dropoff_lng,
                    $gridSize
                );
                return "{$pickupGrid}|{$dropoffGrid}";
            });

        return response()->json([
            'grids' => $rides->map(function ($groupRides, $gridKey) {
                list($pickupGrid, $dropoffGrid) = explode('|', $gridKey);
                return [
                    'pickup_grid' => $pickupGrid,
                    'dropoff_grid' => $dropoffGrid,
                    'rides' => $groupRides->map(function ($ride) {
                        return [
                            'id' => $ride->id,
                            'user_id' => $ride->user_id,
                            'user_name' => $ride->user->name ?? 'Guest',
                            'pickup' => [
                                'lat' => $ride->pickup_lat,
                                'lng' => $ride->pickup_lng,
                                'address' => $ride->pickup_address
                            ],
                            'dropoff' => [
                                'lat' => $ride->dropoff_lat,
                                'lng' => $ride->dropoff_lng,
                                'address' => $ride->dropoff_address
                            ],
                            'time' => $ride->created_at
                        ];
                    }),
                    'count' => $groupRides->count()
                ];
            })->values()
        ]);
    }

    private function calculateGrid($lat, $lng, $gridSize)
    {
        $latGrid = floor($lat / $gridSize);
        $lngGrid = floor($lng / $gridSize);
        return "{$latGrid}_{$lngGrid}";
    }

    // 1. Store the Ride Request
    public function store(Request $request)
    {

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

        // 3. Validation (Removed guest fields as they are no longer allowed)
        $validated = $request->validate([
            'pickup.lat' => 'required|numeric',
            'pickup.lng' => 'required|numeric',
            'dropoff.lat' => 'required|numeric',
            'dropoff.lng' => 'required|numeric',
            'commute_time' => 'required|date',
            'frequency' => 'required|string',
            'category' => 'required|string',
        ]);

        // 4. Prepare data for saving

        $data = [
            'user_id' => $user->id,
            'pickup_lat' => $validated['pickup.lat'],
            'pickup_lng' => $validated['pickup.lng'],
            'dropoff_lat' => $validated['dropoff.lat'],
            'dropoff_lng' => $validated['dropoff.lng'],
            'commute_time' => $validated['commute_time'],
            'frequency' => $validated['frequency'],
            'category' => $validated['category'],
            'status' => 'pending',
        ];


        $ride = RideRequest::create($data);
        #Log::info("stored ride details for user:", $user);
        return response()->json([
            'message' => 'Ride request submitted successfully',
            'data' => $ride
        ], 201);
    }


}
