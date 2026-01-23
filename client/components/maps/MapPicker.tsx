import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Fix for default Leaflet marker icon missing in Webpack/Vite
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

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

// Component to handle click events on the map
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
  // Updated to Toronto, Canada coordinates
  const defaultCenter = { lat: 43.6532, lng: -79.3832 };
  const [map, setMap] = useState<L.Map | null>(null);

  // Use useEffect to force map resize after mount and when step changes
  useEffect(() => {
    if (map) {
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }
  }, [map]);

  return (
    <div className="flex flex-col h-full w-full min-h-0">
      <h3 className="text-xl font-bold text-stone-700 mb-4 px-1">{label}</h3>
      <div className="flex-1 min-h-[150px] max-h-[250px] rounded-xl overflow-hidden border border-stone-200 shadow-inner relative">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          style={{ height: "10%", width: "50%" }}
          key={label}
          whenCreated={setMap} // Capture map instance
        >
          {/* Replace this URL with your MapTiler or Geopify URL */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            //url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            // For MapTiler:
            url="https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=VM0YGHREJULAld5WIX3J"
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
