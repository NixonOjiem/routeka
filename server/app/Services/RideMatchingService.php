<?php

namespace App\Services;

use App\Models\RideRequest;
use App\Models\ChatRoom;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RideMatchingService
{
    /**
     * Get grouped rides and ensure chat rooms exist
     */
    public function getGroupedRides()
    {
        // 1. Get all active ride requests
        $allRequests = RideRequest::with('user')
            ->where('status', 'pending')
            ->get();

        $groups = [];
        $processedIds = [];

        // Grid size in degrees (approximately 1 mile)
        $gridSize = 0.0145; // ~1 mile in degrees

        foreach ($allRequests as $request) {
            if (in_array($request->id, $processedIds)) {
                continue;
            }

            // Calculate grid coordinates
            $pickupGrid = $this->calculateGrid($request->pickup_lat, $request->pickup_lng, $gridSize);
            $dropoffGrid = $this->calculateGrid($request->dropoff_lat, $request->dropoff_lng, $gridSize);

            // Find matches in same grid
            $matches = RideRequest::query()
                ->where('id', '!=', $request->id)
                ->whereNotIn('id', $processedIds)
                ->where('status', 'pending')
                ->whereRaw("
                    ABS(pickup_lat - ?) <= ? AND
                    ABS(pickup_lng - ?) <= ? AND
                    ABS(dropoff_lat - ?) <= ? AND
                    ABS(dropoff_lng - ?) <= ?
                ", [
                    $request->pickup_lat, $gridSize,
                    $request->pickup_lng, $gridSize,
                    $request->dropoff_lat, $gridSize,
                    $request->dropoff_lng, $gridSize
                ])
                ->with('user')
                ->get();

            if ($matches->count() > 0) {
                // Create group with matches
                $groupMembers = $matches->push($request);

                foreach ($groupMembers as $member) {
                    $processedIds[] = $member->id;
                }

                // Create or get chat room for this group
                $chatRoom = $this->getOrCreateChatRoom($groupMembers, $pickupGrid, $dropoffGrid);

                $groups[] = [
                    'group_id' => 'group_' . $request->id,
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
                            'pickup' => [
                                'lat' => $member->pickup_lat,
                                'lng' => $member->pickup_lng,
                                'address' => $member->pickup_address
                            ],
                            'dropoff' => [
                                'lat' => $member->dropoff_lat,
                                'lng' => $member->dropoff_lng,
                                'address' => $member->dropoff_address
                            ]
                        ];
                    })
                ];
            } else {
                // Solo ride
                $groups[] = [
                    'group_id' => 'solo_' . $request->id,
                    'chat_room_id' => null,
                    'meetup_point' => [
                        'lat' => $request->pickup_lat,
                        'lng' => $request->pickup_lng
                    ],
                    'pickup_grid' => $pickupGrid,
                    'dropoff_grid' => $dropoffGrid,
                    'member_count' => 1,
                    'members' => [$request]
                ];
                $processedIds[] = $request->id;
            }
        }

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
    private function getOrCreateChatRoom($groupMembers, $pickupGrid, $dropoffGrid)
    {
        $rideIds = $groupMembers->pluck('id')->toArray();
        $userIds = $groupMembers->pluck('user_id')->filter()->unique()->toArray();

        // Generate unique room ID based on grid and member count
        $roomId = "chat_" . md5($pickupGrid . '_' . $dropoffGrid . '_' . implode('_', $rideIds));

        $chatRoom = ChatRoom::where('room_id', $roomId)->first();

        if (!$chatRoom) {
            $chatRoom = ChatRoom::create([
                'room_id' => $roomId,
                'name' => "Ride Group - " . Str::random(6),
                'ride_ids' => $rideIds,
                'user_ids' => $userIds,
                'pickup_grid' => $pickupGrid,
                'dropoff_grid' => $dropoffGrid
            ]);
        } else {
            // Update existing room with new members if needed
            $existingRideIds = $chatRoom->ride_ids;
            $newRideIds = array_unique(array_merge($existingRideIds, $rideIds));

            if (count($newRideIds) > count($existingRideIds)) {
                $chatRoom->update([
                    'ride_ids' => $newRideIds,
                    'user_ids' => array_unique(array_merge($chatRoom->user_ids ?? [], $userIds))
                ]);
            }
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
        $count = $rides->count();

        foreach ($rides as $ride) {
            $totalLat += $ride->pickup_lat;
            $totalLng += $ride->pickup_lng;
        }

        return [
            'lat' => $totalLat / $count,
            'lng' => $totalLng / $count,
            'name' => 'Suggested Meetup Spot'
        ];
    }

    /**
     * Get all available chat rooms for a user/guest
     */
    public function getAvailableChatRooms($userId = null)
    {
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
    }
}
