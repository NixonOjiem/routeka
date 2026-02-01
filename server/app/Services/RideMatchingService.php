<?php

namespace App\Services;

use App\Models\ChatRoom;
use App\Models\RideRequest;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

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
            #$mixedGroups = $this->runGridMatching($allRequests, 'suggested');
            $mixedGroups = $this->runGridMatching($allRequests, 'suggested');

            $mixedGroups = array_filter($mixedGroups, function($group) {
                return $group['member_count'] > 1;
            });

            // Optimization: Only add mixed groups that are "better" (e.g., have members)
            // or simply add them all. For now, we add them all but filter purely distinct
            // single riders might be redundant, but good for UI "Suggested" tab.
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
            if (in_array($request->id, $processedIds)) continue;

            $pickupGrid = $this->calculateGrid($request->pickup_lat, $request->pickup_lng, $gridSize);
            $dropoffGrid = $this->calculateGrid($request->dropoff_lat, $request->dropoff_lng, $gridSize);
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
            foreach ($groupMembers as $member) $processedIds[] = $member->id;

            // For specific category tabs, we include Solo riders (waiting for match)
            // For suggested, we usually only want actual matches (handled in parent function)

            $chatRoom = $this->getOrCreateChatRoom($groupMembers, $pickupGrid, $dropoffGrid, $groupType);

            $groups[] = [
                'group_id' => $groupType . '_' . $request->id,
                'group_type' => $groupType,
                'chat_room_id' => $chatRoom->room_id,
                'meetup_point' => $this->calculateCentroid($groupMembers),
                'pickup_grid' => $pickupGrid,
                'dropoff_grid' => $dropoffGrid,
                'member_count' => $groupMembers->count(),
                'members' => $groupMembers->map(function($member) {
                    return [
                        'id' => $member->id,
                        'user_id' => $member->user_id,
                        'user_name' => $member->user->name ?? 'Guest',
                        'category' => $member->category,
                        'scheduled_time' => $member->scheduled_time, // Send time to frontend
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
     * Calculate grid identifier for coordinates
     */
    private function calculateGrid($lat, $lng, $gridSize)
    {
        $latGrid = floor($lat / $gridSize);
        $lngGrid = floor($lng / $gridSize);
        return "{$latGrid}_{$lngGrid}";
    }

    /**
     * Get or create chat room for a group
     */
    private function getOrCreateChatRoom($groupMembers, $pickupGrid, $dropoffGrid, $context = 'general')
    {
        $rideIds = $groupMembers->pluck('id')->toArray();
        $userIds = $groupMembers->pluck('user_id')->filter()->unique()->toArray();

        // Unique Room ID includes context so a 'suggested' chat is different from a 'corporate' chat
        $hash = md5($pickupGrid . '_' . $dropoffGrid . '_' . implode('_', $rideIds) . '_' . $context);
        $roomId = "chat_" . $hash;

        $chatRoom = ChatRoom::where('room_id', $roomId)->first();

        if (!$chatRoom) {
            $chatRoom = ChatRoom::create([
                'room_id' => $roomId,
                'name' => ucfirst($context) . " Ride Group",
                'ride_ids' => $rideIds,
                'user_ids' => $userIds,
                'pickup_grid' => $pickupGrid,
                'dropoff_grid' => $dropoffGrid
            ]);
        } else {
            // Update logic (simplified for brevity)
             $chatRoom->update([
                'ride_ids' => $rideIds,
                'user_ids' => $userIds
            ]);
        }

        return $chatRoom;
    }

    /**
     * Calculate centroid of group
     */
    private function calculateCentroid($rides)
{
    $totalLat = 0;
    $totalLng = 0;

    foreach ($rides as $ride) {
        $totalLat += $ride->pickup_lat;
        $totalLng += $ride->pickup_lng;
    }

    $avgLat = $totalLat / $rides->count();
    $avgLng = $totalLng / $rides->count();

    // Log the values clearly
    Log::info('Calculated centroid', [
        'totalLat' => $totalLat,
        'totalLng' => $totalLng,
        'avgLat'   => $avgLat,
        'avgLng'   => $avgLng,
        'count'    => $rides->count()
    ]);

    return [
        'lat' => $avgLat,
        'lng' => $avgLng,
        'name' => 'Suggested Meetup'
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
                $query->whereJsonContains('user_ids', (string)$userId);
            }

            return $query->with(['messages' => function($q) {
                $q->orderBy('created_at', 'desc')->limit(20);
            }])->get()->map(function($room) {
                return [
                    'room_id' => $room->room_id,
                    'name' => $room->name,
                    'pickup_grid' => $room->pickup_grid,
                    'dropoff_grid' => $room->dropoff_grid,
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

}
