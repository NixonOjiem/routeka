<?php

namespace App\Http\Controllers;

use App\Models\RideRequest;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Services\RideMatchingService;
use Illuminate\Validation\ValidationException;

class RideRequestController extends Controller
{
    protected $rideService;

    public function __construct(RideMatchingService $rideService)
    {
        $this->rideService = $rideService;
    }

    // 1. Store the Ride Request
    public function store(Request $request)
{
    $user = Auth::user();

// inside store(Request $request)
\Log::info('Request headers', $request->headers->all());

    Log::info('Authenticated user:', ['user' => $user]);
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


    // 2. Fetch Grouped Data (For Admin or "My Matches" view)
    public function index()
    {
        $groupedRides = $this->rideService->getGroupedRides();

        return response()->json([
            'groups' => $groupedRides
        ]);
    }
}
