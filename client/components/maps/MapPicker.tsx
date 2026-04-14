import React, { useState, useEffect, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Locate, Loader2, Search } from "lucide-react";
import "leaflet/dist/leaflet.css";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const map_Tiler_key = import.meta.env.VITE_MAPTILLER_KEY;

// Bounding box for Canada
const CANADA_BOUNDS: L.LatLngBoundsExpression = [
  [41.67, -141.0],
  [83.11, -52.65],
];

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

interface GeocodingResult {
  id: string;
  place_name: string;
  center: [number, number];
  bbox?: [number, number, number, number];
}

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
  initialLat,
  initialLng,
}) => {
  // Determine initial center based on props or fallback to Toronto
  const initialCenter = {
    lat: initialLat ?? 43.6532,
    lng: initialLng ?? -79.3832,
  };
  const initialZoom = initialLat && initialLng ? 15 : 13;

  const [center, setCenter] = useState(initialCenter);
  const [zoom, setZoom] = useState(initialZoom);

  const [map, setMap] = useState<L.Map | null>(null);
  const [markerPosition, setMarkerPosition] = useState<L.LatLng | null>(
    initialLat && initialLng ? new L.LatLng(initialLat, initialLng) : null,
  );
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Prompt for user location on mount if no initial coordinates provided
  useEffect(() => {
    if (initialLat !== undefined && initialLng !== undefined) return;

    const timer = setTimeout(() => {
      if (
        navigator.geolocation &&
        window.confirm("Use your current location to start?")
      ) {
        handleMyLocation();
      }
    }, 100); // slight delay to let map render

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // runs once on mount

  // Resize observer
  useEffect(() => {
    if (!map) return;
    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(map.getContainer());
    return () => resizeObserver.disconnect();
  }, [map]);

  // Click outside closes suggestions
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        )}.json?key=${map_Tiler_key}&limit=5&country=ca`,
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

    setMarkerPosition(newLatLng);
    setSearchQuery(suggestion.place_name);
    setShowSuggestions(false);
    onLocationSelect(lat, lng);

    // Update center/zoom state
    setCenter({ lat, lng });
    setZoom(15);

    if (map) {
      if (suggestion.bbox) {
        const [west, south, east, north] = suggestion.bbox;
        map.fitBounds(
          [
            [south, west],
            [north, east],
          ],
          { padding: [50, 50] },
        );
        // Sync zoom state after fitBounds
        setTimeout(() => setZoom(map.getZoom()), 0);
      } else {
        map.flyTo(newLatLng, 15, { animate: true, duration: 1.5 });
      }
    }
  };

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

        setMarkerPosition(newLatLng);
        onLocationSelect(latitude, longitude);

        // Update center/zoom state
        setCenter({ lat: latitude, lng: longitude });
        setZoom(15);

        if (map) {
          map.flyTo(newLatLng, 15, { animate: true, duration: 1.5 });
        }

        // Reverse geocode to update search field
        fetch(
          `https://api.maptiler.com/geocoding/${longitude},${latitude}.json?key=${map_Tiler_key}&country=ca`,
        )
          .then((res) => res.json())
          .then((data) => {
            if (data.features?.length) {
              setSearchQuery(data.features[0].place_name);
            }
          })
          .catch(console.error)
          .finally(() => setIsLoadingLocation(false));
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to retrieve your location. Please check permissions.");
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
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
          center={[center.lat, center.lng]}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
          key={`${center.lat}-${center.lng}-${label}`}
          ref={setMap}
          zoomControl={false}
          maxBounds={CANADA_BOUNDS}
          maxBoundsViscosity={1.0}
          minZoom={3}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url={`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${map_Tiler_key}`}
            maxZoom={19}
            minZoom={3}
          />
          <LocationMarker
            position={markerPosition}
            setPosition={setMarkerPosition}
            onSelect={onLocationSelect}
          />
        </MapContainer>

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
