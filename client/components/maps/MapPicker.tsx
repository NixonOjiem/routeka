import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
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

const LocationMarker = ({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void;
}) => {
  const [position, setPosition] = useState<L.LatLng | null>(null);

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
  const [map, setMap] = useState<L.Map | null>(null);

  // --- THE FIX: RESIZE OBSERVER ---
  useEffect(() => {
    if (!map) return;

    // Create an observer that watches for size changes in the map container
    const resizeObserver = new ResizeObserver(() => {
      // Whenever the div size changes (e.g. animation finishes), tell Leaflet to fit
      map.invalidateSize();
    });

    // Start observing the map's container HTML element
    resizeObserver.observe(map.getContainer());

    // Clean up when component unmounts
    return () => {
      resizeObserver.disconnect();
    };
  }, [map]);

  return (
    <div className="flex flex-col h-full w-full min-h-0">
      <h3 className="text-xl font-bold text-stone-700 mb-4 px-1">{label}</h3>

      {/* Container wrapper */}
      <div className="flex-1 min-h-[150px] max-h-[250px] rounded-xl overflow-hidden border border-stone-200 shadow-inner relative z-0">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          key={label}
          whenCreated={setMap}
        >
          {/* --- WINTER STYLE APPLIED BELOW --- */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url={`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${map_Tiler_key}`} // winter-v2
          />
          <LocationMarker onSelect={onLocationSelect} />
        </MapContainer>
      </div>
      <p className="text-sm text-stone-500 mt-2 text-center">
        Click on the map to place the pin.
      </p>
    </div>
  );
};
