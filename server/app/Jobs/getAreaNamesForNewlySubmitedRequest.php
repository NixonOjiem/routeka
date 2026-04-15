<?php

namespace App\Jobs;

use App\Models\RideRequest;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class getAreaNamesForNewlySubmitedRequest implements ShouldQueue
{
    use Queueable, Dispatchable, InteractsWithQueue, SerializesModels;

    /**
     * @var RideRequest
     */
    public $rideRequest;

    /**
     * Create a new job instance.
     */
    public function __construct(RideRequest $rideRequest)
    {
        $this->rideRequest = $rideRequest;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $apiKey = config('services.geocodio.key');

        if (!$apiKey) {
            Log::error('Geocodio API key is missing. Cannot fetch area names.');
            return;
        }

        try {
            // 1. Fetch Pickup Area Name
            $pickupName = $this->reverseGeocode(
                $this->rideRequest->pickup_lat,
                $this->rideRequest->pickup_lng,
                $apiKey
            );

            // 2. Fetch Dropoff Area Name
            $dropoffName = $this->reverseGeocode(
                $this->rideRequest->dropoff_lat,
                $this->rideRequest->dropoff_lng,
                $apiKey
            );

            // 3. Update the database if we got results
            $this->rideRequest->update([
                'pickup_name' => $pickupName ?? $this->rideRequest->pickup_name,
                'dropoff_name' => $dropoffName ?? $this->rideRequest->dropoff_name,
            ]);

            Log::info("Geocodio job completed successfully for Ride ID: {$this->rideRequest->id}", [
                'pickup_name' => $pickupName,
                'dropoff_name' => $dropoffName
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to fetch area names from Geocodio for Ride ID: {$this->rideRequest->id}", [
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Helper method to call the Geocodio API
     */
    private function reverseGeocode($lat, $lng, $apiKey)
    {
        $response = Http::timeout(10)->get('https://api.geocod.io/v1.12/reverse', [
            'q' => "{$lat},{$lng}",
            'api_key' => $apiKey
        ]);

        if ($response->successful() && !empty($response->json('results'))) {
            // Returns the primary formatted address.
            // If you prefer just the city/neighborhood, you can change this to 'results.0.address_components.city'
            return $response->json('results.0.formatted_address');
        }

        return null;
    }
}
