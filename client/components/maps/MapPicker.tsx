import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Locate, Loader2 } from "lucide-react"; // Import icons
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

export const MapPicker: React.FC<MapPickerProps> = ({
  label,
  onLocationSelect,
}) => {
  const defaultCenter = { lat: 43.6532, lng: -79.3832 };

  // State for the map instance
  const [map, setMap] = useState<L.Map | null>(null);

  // State for the marker position (Lifted up so the button can access it)
  const [markerPosition, setMarkerPosition] = useState<L.LatLng | null>(null);

  // State for loading status
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // --- RESIZE OBSERVER (Kept from previous fix) ---
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

  // --- NEW: Handle "Use My Location" ---
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

        setIsLoadingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to retrieve your location. Please check permissions.");
        setIsLoadingLocation(false);
      },
    );
  };

  return (
    <div className="flex flex-col h-full w-full min-h-0">
      <div className="flex justify-between items-end mb-4 px-1">
        <h3 className="text-xl font-bold text-stone-700">{label}</h3>

        {/* --- NEW BUTTON --- */}
        <button
          onClick={handleMyLocation}
          disabled={isLoadingLocation}
          className="text-xs font-bold uppercase tracking-wide text-brand hover:text-brand-dark flex items-center gap-1 transition-colors disabled:opacity-50"
          type="button" // Prevent form submission
        >
          {isLoadingLocation ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Locate size={16} />
          )}
          {isLoadingLocation ? "Locating..." : "Use My Location"}
        </button>
      </div>

      <div className="flex-1 min-h-[150px] max-h-[250px] rounded-xl overflow-hidden border border-stone-200 shadow-inner relative z-0">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          key={label}
          whenCreated={setMap}
        >
          {/* --- WINTER STYLE --- */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url={`https://api.maptiler.com/maps/winter-v2/{z}/{x}/{y}.png?key=${map_Tiler_key}`}
          />

          {/* Passing state down to the marker component */}
          <LocationMarker
            position={markerPosition}
            setPosition={setMarkerPosition}
            onSelect={onLocationSelect}
          />
        </MapContainer>
      </div>

      <p className="text-sm text-stone-500 mt-2 text-center">
        Click on the map or use the button to place the pin.
      </p>
    </div>
  );
};
