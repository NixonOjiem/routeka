<?php

namespace App\Http\Controllers;

use App\Models\RideRequest;
use App\Services\RideMatchingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
    $user = Auth::user(); // may be null

    // Merge user_id into the request so validation rules that reference user_id work
    $request->merge(['user_id' => $user ? $user->id : null]);

    // Validation
    $validated = $request->validate([
        'pickup.lat' => 'required|numeric',
        'pickup.lng' => 'required|numeric',
        'dropoff.lat' => 'required|numeric',
        'dropoff.lng' => 'required|numeric',
        'commute_time' => 'required|date',
        'frequency' => 'required|string',
        // Guest validation fields (required only if not logged in)
        'guest_name' => 'required_without:user_id|string',
        'guest_email' => 'required_without:user_id|email',
        'guest_phone' => 'required_without:user_id|string',
    ]);

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
