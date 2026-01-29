import React, { useState, useEffect, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Locate, Loader2, Search } from "lucide-react";
import "leaflet/dist/leaflet.css";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const map_Tiler_key = import.meta.env.VITE_MAPTILLER_KEY;

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
  label: string;
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

// Geocoding result interface
interface GeocodingResult {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
  bbox?: [number, number, number, number]; // [west, south, east, north]
}

// Updated Component: Now accepts position/setPosition from parent
const LocationMarker = ({
  position,
  setPosition,
  onSelect,
}: {
  position: L.LatLng | null;
  setPosition: (pos: L.LatLng) => void;
  onSelect: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : <Marker position={position} />;
};

// Debounce utility function
const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const MapPicker: React.FC<MapPickerProps> = ({
  label,
  onLocationSelect,
}) => {
  // Faster default center - use user's approximate location if available, fallback to Toronto
  const [defaultCenter, setDefaultCenter] = useState<{
    lat: number;
    lng: number;
  }>({
    lat: 43.6532,
    lng: -79.3832,
  });
  const [defaultZoom, setDefaultZoom] = useState(13);

  // State for the map instance
  const [map, setMap] = useState<L.Map | null>(null);

  // State for the marker position
  const [markerPosition, setMarkerPosition] = useState<L.LatLng | null>(null);

  // State for loading status
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // State for search
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Try to get approximate user location for faster initial load
  useEffect(() => {
    const getApproximateLocation = () => {
      // Check if we have a cached location
      const cachedLocation = localStorage.getItem("userApproxLocation");
      if (cachedLocation) {
        try {
          const { lat, lng, timestamp } = JSON.parse(cachedLocation);
          // Use cached location if it's less than 1 day old
          if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
            setDefaultCenter({ lat, lng });
            setDefaultZoom(10); // Zoom out a bit for approximate location
            return;
          }
        } catch (e) {
          // Invalid cache, continue
        }
      }

      // Try to get location from IP or use browser's low-accuracy geolocation
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const newCenter = { lat: latitude, lng: longitude };
            setDefaultCenter(newCenter);
            setDefaultZoom(10);

            // Cache the approximate location
            localStorage.setItem(
              "userApproxLocation",
              JSON.stringify({
                lat: latitude,
                lng: longitude,
                timestamp: Date.now(),
              }),
            );
          },
          () => {
            // If geolocation fails, use IP-based location
            fetchIPLocation();
          },
          {
            maximumAge: 600000, // Accept cached position up to 10 minutes old
            timeout: 5000,
            enableHighAccuracy: false, // Faster, less accurate
          },
        );
      } else {
        fetchIPLocation();
      }
    };

    const fetchIPLocation = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        if (data.latitude && data.longitude) {
          setDefaultCenter({ lat: data.latitude, lng: data.longitude });
          setDefaultZoom(10);
        }
      } catch (error) {
        console.log("Using default Toronto location");
      }
    };

    getApproximateLocation();
  }, []);

  // --- RESIZE OBSERVER ---
  useEffect(() => {
    if (!map) return;
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(map.getContainer());
    return () => {
      resizeObserver.disconnect();
    };
  }, [map]);

  // --- CLICK OUTSIDE TO CLOSE SUGGESTIONS ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --- SEARCH/ GEOCODING FUNCTIONS ---
  const geocodeSearch = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(
          query,
        )}.json?key=${map_Tiler_key}&limit=5`,
      );
      const data = await response.json();
      setSuggestions(data.features || []);
    } catch (error) {
      console.error("Geocoding error:", error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced geocode function
  const debouncedGeocode = useCallback(
    debounce((query: string) => geocodeSearch(query), 300),
    [],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(true);
    debouncedGeocode(value);
  };

  const handleSuggestionClick = (suggestion: GeocodingResult) => {
    const [lng, lat] = suggestion.center;
    const newLatLng = new L.LatLng(lat, lng);

    // Update marker
    setMarkerPosition(newLatLng);

    // Update search query
    setSearchQuery(suggestion.place_name);

    // Close suggestions
    setShowSuggestions(false);

    // Notify parent
    onLocationSelect(lat, lng);

    // Move map to location
    if (map) {
      map.flyTo(newLatLng, 15, {
        animate: true,
        duration: 1.5,
      });

      // If suggestion has a bounding box, fit the map to it
      if (suggestion.bbox) {
        const [west, south, east, north] = suggestion.bbox;
        map.fitBounds(
          [
            [south, west],
            [north, east],
          ],
          { padding: [50, 50] },
        );
      }
    }
  };

  // --- HANDLE "USE MY LOCATION" ---
  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLatLng = new L.LatLng(latitude, longitude);

        // 1. Update Marker State
        setMarkerPosition(newLatLng);

        // 2. Notify Parent Form
        onLocationSelect(latitude, longitude);

        // 3. Move Map to new location
        if (map) {
          map.flyTo(newLatLng, 15, {
            animate: true,
            duration: 1.5,
          });
        }

        // 4. Update search query with approximate address
        const reverseGeocode = async () => {
          try {
            const response = await fetch(
              `https://api.maptiler.com/geocoding/${longitude},${latitude}.json?key=${map_Tiler_key}`,
            );
            const data = await response.json();
            if (data.features && data.features.length > 0) {
              setSearchQuery(data.features[0].place_name);
            }
          } catch (error) {
            console.error("Reverse geocoding error:", error);
          }
        };
        reverseGeocode();

        setIsLoadingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to retrieve your location. Please check permissions.");
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  return (
    <div className="flex flex-col h-full w-full min-h-0">
      <div className="flex justify-between items-end mb-4 px-1">
        <h3 className="text-xl font-bold text-stone-700">{label}</h3>

        <button
          onClick={handleMyLocation}
          disabled={isLoadingLocation}
          className="text-xs font-bold uppercase tracking-wide text-brand hover:text-brand-dark flex items-center gap-1 transition-colors disabled:opacity-50"
          type="button"
        >
          {isLoadingLocation ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Locate size={16} />
          )}
          {isLoadingLocation ? "Locating..." : "Use My Location"}
        </button>
      </div>

      {/* Search Input with Autocomplete */}
      <div className="relative mb-4" ref={searchContainerRef}>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400"
            size={18}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search for an address, city, or landmark..."
            className="w-full pl-10 pr-10 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
          />
          {isSearching && (
            <Loader2
              className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-stone-400"
              size={18}
            />
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-stone-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                className="w-full text-left px-4 py-3 hover:bg-stone-50 transition-colors border-b border-stone-100 last:border-b-0"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="font-medium text-stone-800">
                  {suggestion.place_name}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No results message */}
        {showSuggestions &&
          searchQuery.length >= 2 &&
          !isSearching &&
          suggestions.length === 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-stone-200 rounded-lg shadow-lg p-4">
              <p className="text-stone-500 text-center">No locations found</p>
            </div>
          )}
      </div>

      <div className="flex-1 min-h-[150px] max-h-[300px] rounded-xl overflow-hidden border border-stone-200 shadow-inner relative z-0">
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ height: "100%", width: "100%" }}
          key={`${defaultCenter.lat}-${defaultCenter.lng}-${label}`} // Key changes when center updates
          whenCreated={setMap}
          zoomControl={false}
        >
          {/* Tile Layer with loading optimization */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url={`https://api.maptiler.com/maps/winter-v2/{z}/{x}/{y}.png?key=${map_Tiler_key}`}
            maxZoom={19}
            minZoom={1}
          />

          {/* Passing state down to the marker component */}
          <LocationMarker
            position={markerPosition}
            setPosition={setMarkerPosition}
            onSelect={onLocationSelect}
          />
        </MapContainer>

        {/* Map Controls */}
        <div className="absolute top-2 right-2 z-[1000] flex flex-col gap-2">
          <button
            onClick={() => map?.zoomIn()}
            className="bg-white hover:bg-stone-50 w-8 h-8 flex items-center justify-center rounded-lg shadow-md border border-stone-200"
            type="button"
          >
            <span className="font-bold text-stone-700">+</span>
          </button>
          <button
            onClick={() => map?.zoomOut()}
            className="bg-white hover:bg-stone-50 w-8 h-8 flex items-center justify-center rounded-lg shadow-md border border-stone-200"
            type="button"
          >
            <span className="font-bold text-stone-700">−</span>
          </button>
        </div>
      </div>

      <p className="text-sm text-stone-500 mt-2 text-center">
        Click on the map, search for a location, or use the location button to
        place the pin.
      </p>
    </div>
  );
};
