import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map center changes
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

const MapView = ({ parks, selectedPark, onMarkerClick }) => {
  const lagosCenter = [6.458985, 3.426131]; // Lagos Center
  
  return (
    <MapContainer 
      center={selectedPark ? [selectedPark.lat, selectedPark.lng] : lagosCenter} 
      zoom={12} 
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {selectedPark && (
        <ChangeView center={[selectedPark.lat, selectedPark.lng]} zoom={14} />
      )}

      {parks.map(park => (
        <Marker 
          key={park.id} 
          position={[park.lat, park.lng]}
          eventHandlers={{
            click: () => onMarkerClick(park),
          }}
        >
          <Popup>
            <div className="map-popup">
              <strong>{park.name}</strong>
              <p>{park.location}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;
