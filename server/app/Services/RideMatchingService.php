<?php

namespace App\Services;

use App\Models\ChatRoom;
use App\Models\RideRequest;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class RideMatchingService
{
    /**
     * Get grouped rides and ensure chat rooms exist
     */
    public function getGroupedRides()
    {
        try {
            $hasStatusColumn = Schema::hasColumn('ride_requests', 'status');

            // 1. Get all pending requests
            $query = RideRequest::with('user');
            if ($hasStatusColumn) {
                $query->where('status', 'pending');
            }
            $allRequests = $query->get();

            // The master list of groups to return
            $allGroups = [];

            // --- A. STRICT CATEGORY MATCHING ---
            // We group by category first, then run logic inside each bucket
            $categories = ['corporate', 'neighborhood', 'events', 'university'];

            foreach ($categories as $category) {
                // Filter requests for this category
                $catRequests = $allRequests->where('category', $category);

                // Find groups strictly within this category
                $catGroups = $this->runGridMatching($catRequests, $category);

                // Merge into master list
                $allGroups = array_merge($allGroups, $catGroups);
            }

            // --- B. SUGGESTED (MIXED) MATCHING ---
            // Run logic on ALL requests, ignoring category.
            // We label these as 'suggested'.
            $mixedGroups = $this->runGridMatching($allRequests, 'suggested');

            $mixedGroups = array_filter($mixedGroups, function ($group) {
                return $group['member_count'] > 1;
            });

            $allGroups = array_merge($allGroups, $mixedGroups);

            return $allGroups;

        } catch (\Exception $e) {
            Log::error('Error in getGroupedRides: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Reusable matching logic
     * @param $requests - Collection of RideRequest
     * @param $groupType - string (corporate, suggested, etc)
     */
    private function runGridMatching($requests, $groupType)
    {
        $groups = [];
        $processedIds = []; // Local to this run
        $gridSize = 0.0145; // ~1 mile

        // Sort by ID to ensure consistent grouping order
        $sortedRequests = $requests->sortBy('id');

        foreach ($sortedRequests as $request) {
            if (in_array($request->id, $processedIds))
                continue;

            // Calculate grid centers for pickup and dropoff
            $pickupGridCenter = $this->calculateGridCenter($request->pickup_lat, $request->pickup_lng, $gridSize);
            $dropoffGridCenter = $this->calculateGridCenter($request->dropoff_lat, $request->dropoff_lng, $gridSize);

            Log::info('Request from ride matching service:', $request->toArray());
            $reqTime = Carbon::parse($request->commute_time ?? $request->commute_time);

            // Find matches within the passed collection
            $matches = $sortedRequests->filter(function ($item) use ($request, $processedIds, $gridSize, $reqTime) {

                // Parse item time
                $itemTime = Carbon::parse($item->scheduled_time ?? $item->created_at);

                // TIME CHECK: Absolute difference in hours
                $hoursDiff = $reqTime->diffInHours($itemTime);

                return $item->id !== $request->id
                    && !in_array($item->id, $processedIds)
                    // Location Checks (1 Mile Grid)
                    && abs($item->pickup_lat - $request->pickup_lat) <= $gridSize
                    && abs($item->pickup_lng - $request->pickup_lng) <= $gridSize
                    && abs($item->dropoff_lat - $request->dropoff_lat) <= $gridSize
                    && abs($item->dropoff_lng - $request->dropoff_lng) <= $gridSize
                    // Time Check (Within 1 hour)
                    && $hoursDiff <= 1;
            });

            $groupMembers = $matches->push($request);
            // Mark processed
            foreach ($groupMembers as $member)
                $processedIds[] = $member->id;

            // For specific category tabs, we include Solo riders (waiting for match)
            // For suggested, we usually only want actual matches (handled in parent function)

            $chatRoom = $this->getOrCreateChatRoom($groupMembers, $pickupGridCenter, $dropoffGridCenter, $groupType);

            // --- NEW: Fetch Names for the Response ---
            // We fetch the name for the GRID CENTER, not the specific user point,
            // so everyone in the group sees the same "Area Name"
            $pickupName = $this->getAreaName($pickupGridCenter['lat'], $pickupGridCenter['lng']);
            $dropoffName = $this->getAreaName($dropoffGridCenter['lat'], $dropoffGridCenter['lng']);

            // Inject names into the grid arrays for the response
            $pickupGridCenter['name'] = $pickupName;
            $dropoffGridCenter['name'] = $dropoffName;

            $groups[] = [
                'group_id' => $groupType . '_' . $request->id,
                'group_type' => $groupType,
                'chat_room_id' => $chatRoom->room_id,
                'meetup_point' => $this->calculateCentroid($groupMembers),
                'pickup_grid' => $pickupGridCenter,
                'dropoff_grid' => $dropoffGridCenter,
                'member_count' => $groupMembers->count(),
                'members' => $groupMembers->map(function ($member) {
                    return [
                        'id' => $member->id,
                        'user_id' => $member->user_id,
                        'user_name' => $member->user->name ?? 'Guest',
                        'category' => $member->category,
                        'scheduled_time' => $member->scheduled_time,
                        'pickup' => [
                            'lat' => $member->pickup_lat,
                            'lng' => $member->pickup_lng,
                        ],
                        'dropoff' => [
                            'lat' => $member->dropoff_lat,
                            'lng' => $member->dropoff_lng,
                        ]
                    ];
                })->values()
            ];
        }
        Log::info('meet point', $groups);

        return $groups;
    }


    /**
     * Calculate grid center coordinates
     */
    private function calculateGridCenter($lat, $lng, $gridSize)
    {
        // Calculate which grid cell the point falls into
        $latGrid = floor($lat / $gridSize);
        $lngGrid = floor($lng / $gridSize);

        // Calculate the center of that grid cell
        $centerLat = ($latGrid * $gridSize) + ($gridSize / 2);
        $centerLng = ($lngGrid * $gridSize) + ($gridSize / 2);

        return [
            'lat' => $centerLat,
            'lng' => $centerLng,
            'grid_cell' => "{$latGrid}_{$lngGrid}" // Keep string version if needed for reference
        ];
    }

    /**
     * Get or create chat room for a group
     */
    private function getOrCreateChatRoom($groupMembers, $pickupGrid, $dropoffGrid, $context = 'general')
    {
        $rideIds = $groupMembers->pluck('id')->toArray();
        $userIds = $groupMembers->pluck('user_id')->filter()->unique()->toArray();

        // Use grid cell strings for hash to maintain uniqueness
        $pickupGridStr = $pickupGrid['grid_cell'];
        $dropoffGridStr = $dropoffGrid['grid_cell'];

        // Unique Room ID includes context so a 'suggested' chat is different from a 'corporate' chat
        $hash = md5($pickupGridStr . '_' . $dropoffGridStr . '_' . implode('_', $rideIds) . '_' . $context);
        $roomId = "chat_" . $hash;

        $chatRoom = ChatRoom::where('room_id', $roomId)->first();

        if (!$chatRoom) {
            $chatRoom = ChatRoom::create([
                'room_id' => $roomId,
                'name' => ucfirst($context) . " Ride Group",
                'ride_ids' => $rideIds,
                'user_ids' => $userIds,
                'pickup_grid' => json_encode($pickupGrid), // Store as JSON
                'dropoff_grid' => json_encode($dropoffGrid), // Store as JSON
                'pickup_grid_str' => $pickupGridStr, // Keep string version for quick reference
                'dropoff_grid_str' => $dropoffGridStr
            ]);
        } else {
            // Update logic
            $chatRoom->update([
                'ride_ids' => $rideIds,
                'user_ids' => $userIds,
                'pickup_grid' => json_encode($pickupGrid),
                'dropoff_grid' => json_encode($dropoffGrid)
            ]);
        }

        return $chatRoom;
    }

    /**
     * Calculate geographic centroid (vector method) of group
     */
    private function calculateCentroid($rides)
    {
        $x = 0.0;
        $y = 0.0;
        $z = 0.0;

        foreach ($rides as $ride) {
            $latRad = deg2rad($ride->pickup_lat);
            $lngRad = deg2rad($ride->pickup_lng);

            $x += cos($latRad) * cos($lngRad);
            $y += cos($latRad) * sin($lngRad);
            $z += sin($latRad);
        }

        $total = $rides->count();
        $x /= $total;
        $y /= $total;
        $z /= $total;

        $lng = atan2($y, $x);
        $hyp = sqrt($x * $x + $y * $y);
        $lat = atan2($z, $hyp);

        $centroidLat = rad2deg($lat);
        $centroidLng = rad2deg($lng);

        // Log the values clearly
        Log::info('Calculated geographic centroid', [
            'lat' => $centroidLat,
            'lng' => $centroidLng,
            'count' => $total
        ]);

        $areaName = $this->getAreaName($centroidLat, $centroidLng);

        return [
            'lat' => $centroidLat,
            'lng' => $centroidLng,
            'name' => $areaName . 'Suggested Meetup'
        ];
    }

    /**
     * Get all available chat rooms for a user/guest
     */
    public function getAvailableChatRooms($userId = null)
    {
        try {
            $query = ChatRoom::where('is_active', true);

            if ($userId) {
                $query->whereJsonContains('user_ids', (string) $userId);
            }

            return $query->with([
                'messages' => function ($q) {
                    $q->orderBy('created_at', 'desc')->limit(20);
                }
            ])->get()->map(function ($room) {
                // Decode JSON grid data
                $pickupGrid = json_decode($room->pickup_grid, true) ?? ['lat' => 0, 'lng' => 0];
                $dropoffGrid = json_decode($room->dropoff_grid, true) ?? ['lat' => 0, 'lng' => 0];

                return [
                    'room_id' => $room->room_id,
                    'name' => $room->name,
                    'pickup_grid' => $pickupGrid,
                    'dropoff_grid' => $dropoffGrid,
                    'member_count' => count($room->ride_ids),
                    'last_message' => $room->messages->first(),
                    'message_count' => $room->messages->count()
                ];
            });

        } catch (\Exception $e) {
            Log::error('Error in getAvailableChatRooms: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get rough area name using MapTiler Reverse Geocoding
     */
    private function getAreaName($lat, $lng)
    {
        // Round coordinates slightly to improve cache hit rate (4 decimal places is ~11m)
        $latKey = round($lat, 4);
        $lngKey = round($lng, 4);
        $cacheKey = "geo_name_{$latKey}_{$lngKey}";

        // 1. Check Cache First
        Log::info('checking cache for key:' . $cacheKey);
        if ($cachedName = Cache::get($cacheKey)) {
            return $cachedName;
        }

        Log::info('starting to fetch reversed geocodes');

        try {
            // FIX: Use config() instead of env() for production safety
            // Ensure you have 'maptiler' => ['key' => env('MAPTILLER_KEY')] in config/services.php
            $apiKey = config('services.maptiler.key');

            if (!$apiKey) {
                Log::error('MapTiler API key is missing in config.');
                return "Unknown Area";
            }

            // MapTiler expects: longitude,latitude
            $url = "https://api.maptiler.com/geocoding/{$lng},{$lat}.json?key={$apiKey}";

            $response = Http::timeout(3)->get($url);

            Log::warning('response from reversed geocodes', [
                'status' => $response->status(),
                'success' => $response->successful(),
            ]);

            if ($response->successful()) {
                $features = $response->json()['features'] ?? [];

                if (!empty($features)) {
                    $locationName = $features[0]['text'] ?? $features[0]['place_name'] ?? null;

                    if ($locationName) {
                        // 2. SUCCESS: Cache valid names for 2 weeks
                        Cache::put($cacheKey, $locationName, now()->addWeeks(2));
                        return $locationName;
                    }
                }
            }
        } catch (\Exception $e) {
            Log::error('MapTiler Error: ' . $e->getMessage());
        }

        // 3. FAILURE: Cache "Unknown Area" briefly (e.g., 1 hour)
        // This protects your API quota from being hammered by requests for the same empty location.
        Cache::put($cacheKey, "Unknown Area", now()->addHour());

        return "Unknown Area";
    }

}
