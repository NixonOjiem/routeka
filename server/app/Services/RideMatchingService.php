<?php

namespace App\Services;

use App\Models\RideRequest;
use Illuminate\Support\Facades\DB;

class RideMatchingService
{
    /**
     * Find groups of users traveling similar routes.
     */
    public function getGroupedRides()
    {
        // 1. Get all requests (You might want to filter by "pending" status in a real app)
        $allRequests = RideRequest::with('user')->get();

        $groups = [];
        $processedIds = [];

        foreach ($allRequests as $request) {
            // Skip if we already grouped this user
            if (in_array($request->id, $processedIds)) {
                continue;
            }

            // 2. Find matches for this specific request
            // Logic: Pickup within 1 mile (1609 meters) AND Dropoff within 1 mile
            $matches = RideRequest::query()
                ->where('id', '!=', $request->id) // Don't match self
                ->whereNotIn('id', $processedIds) // Don't match already grouped people
                ->whereRaw("ST_Distance_Sphere(point(pickup_lng, pickup_lat), point(?, ?)) <= 1609.34", [
                    $request->pickup_lng,
                    $request->pickup_lat
                ])
                ->whereRaw("ST_Distance_Sphere(point(dropoff_lng, dropoff_lat), point(?, ?)) <= 1609.34", [
                    $request->dropoff_lng,
                    $request->dropoff_lat
                ])
                // Optional: Match similar commute times (e.g., within 30 mins)
                // ->whereBetween('commute_time', [$startTime, $endTime])
                ->with('user')
                ->get();

            if ($matches->count() > 0) {
                // We found a group!

                // Add the original request to the matches collection
                $groupMembers = $matches->push($request);

                // Mark all as processed
                foreach ($groupMembers as $member) {
                    $processedIds[] = $member->id;
                }

                // 3. Calculate a "Meetup Point" (Centroid of all pickups)
                $meetupPoint = $this->calculateCentroid($groupMembers);

                $groups[] = [
                    'group_id' => 'group_' . $request->id, // Unique ID for frontend
                    'meetup_point' => $meetupPoint,
                    'member_count' => $groupMembers->count(),
                    'members' => $groupMembers
                ];
            } else {
                // User has no matches yet, they are a "solo" group
                $groups[] = [
                    'group_id' => 'solo_' . $request->id,
                    'meetup_point' => [
                        'lat' => $request->pickup_lat,
                        'lng' => $request->pickup_lng
                    ],
                    'member_count' => 1,
                    'members' => [$request]
                ];
                $processedIds[] = $request->id;
            }
        }

        return $groups;
    }

    /**
     * Calculate the average Lat/Lng of a collection of rides
     *
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
}
