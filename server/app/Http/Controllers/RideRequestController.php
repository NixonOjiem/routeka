<?php

namespace App\Http\Controllers;

use App\Models\RideRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\RideMatchingService;
use Illuminate\Validation\ValidationException;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Illuminate\Support\Facades\Auth;
class RideRequestController extends Controller
{
    protected $rideService;

    public function __construct(RideMatchingService $rideService)
    {
        $this->rideService = $rideService;
    }

    // 2. Fetch Grouped Data (For Admin or "My Matches" view)
     public function index()
{
    $groupedRides = $this->rideService->getGroupedRides();

    // Check if user is logged in via JWT
    $user = Auth::guard('api')->user();

    $chatRooms = $this->rideService->getAvailableChatRooms(
        $user ? $user->id : null
    );

    return response()->json([
        'groups' => $groupedRides,
        'chat_rooms' => $chatRooms,
        'user' => $user ? [
            'id' => $user->id,
            'name' => $user->name
        ] : null
    ]);
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
            ->groupBy(function($ride) use ($gridSize) {
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
            'grids' => $rides->map(function($groupRides, $gridKey) {
                list($pickupGrid, $dropoffGrid) = explode('|', $gridKey);
                return [
                    'pickup_grid' => $pickupGrid,
                    'dropoff_grid' => $dropoffGrid,
                    'rides' => $groupRides->map(function($ride) {
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
    $user = null;
    try {
        $user = JWTAuth::parseToken()->authenticate();
        Log::info('JWT user', ['user' => $user]);
        }
        catch (\Tymon\JWTAuth\Exceptions\TokenExpiredException $e)
        {
            Log::warning('Token expired');
        } catch
        (\Tymon\JWTAuth\Exceptions\TokenInvalidException $e)
        {
            Log::warning('Token invalid');
        } catch (\Exception $e) {
         Log::warning('Token parse error', ['err' => $e->getMessage()]);
        }

// inside store(Request $request)
    Log::info('Request headers', $request->headers->all());

    //Log::info('Authenticated user:', ['user' => $user]);
    // Validation
    $validated = $request->validate([
        'pickup.lat' => 'required|numeric',
        'pickup.lng' => 'required|numeric',
        'dropoff.lat' => 'required|numeric',
        'dropoff.lng' => 'required|numeric',
        'commute_time' => 'required|date',
        'frequency' => 'required|string',
        // Make guest fields nullable but check content if no user
        'guest_name' => 'nullable|string',
        'guest_email' => 'nullable|email',
        'guest_phone' => 'nullable|string',
    ]);

    // Custom validation for guests
    if (!$user) {
        if (empty($request->input('guest_name'))) {
            throw ValidationException::withMessages([
                'guest_name' => ['The guest name field is required for guest users.'],
            ]);
        }
        if (empty($request->input('guest_email'))) {
            throw ValidationException::withMessages([
                'guest_email' => ['The guest email field is required for guest users.'],
            ]);
        }
        if (empty($request->input('guest_phone'))) {
            throw ValidationException::withMessages([
                'guest_phone' => ['The guest phone field is required for guest users.'],
            ]);
        }
    }

    // Prepare data for saving
    $data = [
        'user_id' => $user ? $user->id : null,
        'guest_name' => $user ? null : $request->input('guest_name'),
        'guest_email' => $user ? $user->email : $request->input('guest_email'),
        'guest_phone' => $user ? null : $request->input('guest_phone'),
        'pickup_lat' => $request->input('pickup.lat'),
        'pickup_lng' => $request->input('pickup.lng'),
        'dropoff_lat' => $request->input('dropoff.lat'),
        'dropoff_lng' => $request->input('dropoff.lng'),
        'commute_time' => $request->input('commute_time'),
        'frequency' => $request->input('frequency'),
    ];

    $ride = RideRequest::create($data);

    return response()->json([
        'message' => 'Ride request submitted successfully',
        'data' => $ride
    ], 201);
}



}
