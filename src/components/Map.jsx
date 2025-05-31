import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function Map({ markers }) {
  if (!markers.length) return null;

  const position = markers[0]?.coords;

  return (
    <MapContainer center={position} zoom={13} className="h-96 w-full rounded-lg z-0">
      <TileLayer
        attribution='© <a href="https://locationiq.com/">LocationIQ</a>'
        url={`https://tile.openstreetmap.org/{z}/{x}/{y}.png`}
      />
      {markers.map((marker, idx) => (
        <Marker key={idx} position={marker.coords}>
          <Popup>
            <strong>{marker.day}</strong><br />
            {marker.activity}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
