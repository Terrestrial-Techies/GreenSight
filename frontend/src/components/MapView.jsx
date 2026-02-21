import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { RiChat3Line, RiStarFill, RiDirectionLine } from 'react-icons/ri';
import 'leaflet/dist/leaflet.css';
import SnapshotPanel from './SnapshotPanel';

// Custom SVG Marker with Rating Label
const createIcon = (color, rating, name) => {
  return L.divIcon({
    className: 'custom-pin-container',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="
          background: white; 
          padding: 4px 8px; 
          border-radius: 20px; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
          border: 1px solid rgba(0,0,0,0.05);
          display: flex; 
          align-items: center; 
          gap: 4px;
          margin-bottom: 6px;
          white-space: nowrap;
          animation: slideUp 0.3s ease-out;
        ">
          <span style="color: #F99D1B; font-weight: 800; font-size: 11px;">★</span>
          <span style="font-weight: 800; font-size: 11px; color: #111418;">${rating || '4.8'}</span>
          <div style="width: 1px; height: 10px; background: #EDF0F5;"></div>
          <span style="font-weight: 600; font-size: 11px; color: #36404E;">${name || 'Place'}</span>
        </div>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.3));">
          <path d="M12 21.35C11.8 21.35 11.6 21.3 11.4 21.2C7.3 19.3 4 14.8 4 9.5C4 5.1 7.6 1.5 12 1.5C16.4 1.5 20 5.1 20 9.5C20 14.8 16.7 19.3 12.6 21.2C12.4 21.3 12.2 21.35 12 21.35Z" fill="${color}" stroke="white" stroke-width="2"/>
          <circle cx="12" cy="9.5" r="4" fill="white"/>
        </svg>
      </div>`,
    iconSize: [120, 80],
    iconAnchor: [60, 75]
  });
};

const UserIcon = L.divIcon({
  className: 'user-pin',
  html: `<div style="width: 14px; height: 14px; background: #1792FF; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(23,146,255,0.6);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const ChangeView = ({ center, zoom, bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50], duration: 1.5 });
    } else if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, {
        duration: 1.8,
        easeLinearity: 0.1
      });
    }
  }, [center, zoom, bounds, map]);
  return null;
};

const MapView = ({ parks = [], selectedPark, onMarkerClick }) => {
  const lagosCenter = [6.458985, 3.426131];
  const [userLoc, setUserLoc] = useState(lagosCenter);
  const [route, setRoute] = useState(null);
  const [showDirections, setShowDirections] = useState(false);
  const [showSnapshot, setShowSnapshot] = useState(false);

  // Get real user location and watch for changes
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLoc([position.coords.latitude, position.coords.longitude]);
        },
        (error) => console.error("Error watching location:", error),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);
  
  // Decide which park to show on the map (selected or first available)
  const displayPark = selectedPark || (parks.length > 0 ? parks[0] : null);

  // Fetch route when showDirections is toggled or user position changes
  useEffect(() => {
    if (showDirections && displayPark && userLoc) {
      const fetchRoute = async () => {
        try {
          const url = `https://router.project-osrm.org/route/v1/driving/${userLoc[1]},${userLoc[0]};${displayPark.lng},${displayPark.lat}?overview=full&geometries=geojson`;
          const res = await fetch(url);
          const data = await res.json();
          if (data.routes && data.routes[0]) {
            const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            setRoute(coords);
          }
        } catch (err) {
          console.error("Routing error:", err);
        }
      };
      fetchRoute();
    } else {
      setRoute(null);
    }
  }, [showDirections, displayPark, userLoc]);

  const getConditionColor = (park) => {
    if (!park) return '#07B60A'; 
    const condition = park.condition?.toLowerCase() || 'good';
    if (condition === 'bad') return '#FF000C';
    if (condition === 'average') return '#F99D1B';
    return '#07B60A';
  };

  const markerColor = getConditionColor(displayPark);

  return (
    <div className="px-4">
      <div className="w-full h-[400px] bg-neutral-100 rounded-[32px] overflow-hidden relative shadow-sm border border-black/5">
        <MapContainer 
          center={displayPark ? [displayPark.lat, displayPark.lng] : lagosCenter} 
          zoom={14} 
          className="w-full h-full z-0 font-body"
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <ChangeView 
            center={displayPark ? [displayPark.lat, displayPark.lng] : null} 
            zoom={showDirections ? 13 : 18}
            bounds={route ? L.latLngBounds([userLoc, [displayPark.lat, displayPark.lng]]) : null}
          />

          <Marker position={userLoc} icon={UserIcon} />

          {displayPark && (
            <Marker 
              key={displayPark.id}
              position={[displayPark.lat, displayPark.lng]}
              icon={createIcon(markerColor, '4.8', displayPark.name)}
              eventHandlers={{
                click: () => onMarkerClick && onMarkerClick(displayPark)
              }}
            />
          )}

          {route && (
            <Polyline 
              positions={route} 
              pathOptions={{ 
                color: '#1792FF', 
                weight: 5, 
                opacity: 0.8,
                lineJoin: 'round',
                dashArray: '1, 10'
              }} 
            />
          )}
        </MapContainer>

        {/* Floating Detail Card - Google Maps Style */}
        {displayPark && (
          <div className="absolute bottom-4 left-4 right-4 z-[1000] animate-slide-up">
            <div className="bg-white rounded-2xl p-3 shadow-xl flex gap-3 border border-black/5 backdrop-blur-md bg-white/95">
              <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-50">
                <img 
                  src={displayPark.image || `https://images.unsplash.com/photo-1585829365291-1762f59ed290?auto=format&fit=crop&q=80&w=200`} 
                  alt={displayPark.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="font-bold text-neutral-900 truncate text-base text-xs">{displayPark.name}</h3>
                  <div className="flex items-center gap-1 bg-accent/10 px-1.5 py-0.5 rounded-md">
                    <RiStarFill className="text-accent text-[10px]" />
                    <span className="text-[10px] font-black text-accent">4.8</span>
                  </div>
                </div>
                <p className="text-[11px] text-neutral-400 truncate mb-1">Nearby Green Space • Lagos</p>
                
                {/* AI Review Summary */}
                <div className="bg-neutral-50 px-2 py-1.5 rounded-lg mb-2 border border-black/[0.03]">
                  <p className="text-[10px] text-neutral-600 line-clamp-2 italic">
                    "{displayPark.ai_summary || "AI Summary: A peaceful retreat with great amenities and well-maintained gardens."}"
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    displayPark.condition?.toLowerCase() === 'bad' ? 'bg-error/10 text-error' :
                    displayPark.condition?.toLowerCase() === 'average' ? 'bg-warning/10 text-warning' :
                    'bg-primary/10 text-primary'
                  }`}>
                    {displayPark.condition || 'Good'}
                  </span>
                  
                  <div className="ml-auto flex gap-2">
                    <button 
                      onClick={() => setShowSnapshot(true)}
                      className="bg-neutral-100 text-neutral-900 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-black/5 hover:bg-neutral-200 transition-colors"
                    >
                      Details
                    </button>
                    <button 
                      onClick={() => setShowDirections(!showDirections)}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm ${
                        showDirections 
                        ? 'bg-neutral-900 text-white' 
                        : 'bg-primary text-white hover:bg-primary/90'
                      }`}
                    >
                      <RiDirectionLine size={14} />
                      {showDirections ? 'Close' : 'Directions'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Snapshot Modal Overlay */}
        {showSnapshot && displayPark && (
          <div 
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4 animate-fade-in"
            onClick={(e) => e.target === e.currentTarget && setShowSnapshot(false)}
          >
            {/* Blurred Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md"></div>
            
            {/* Modal Card */}
            <div className="relative w-full max-w-[380px] h-[80vh] bg-white rounded-[32px] shadow-2xl overflow-hidden animate-modal-pop">
              <SnapshotPanel 
                park={displayPark} 
                onClose={() => setShowSnapshot(false)} 
              />
            </div>
          </div>
        )}

        {/* Floating Chat/Help Button */}
        {!displayPark && (
          <button className="absolute bottom-4 right-4 w-12 h-12 bg-white text-neutral-900 rounded-full border border-black/5 flex items-center justify-center z-[1000] shadow-md active:scale-95 transition-transform">
            <RiChat3Line size={24} />
          </button>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes markerDrop {
          from { transform: translateY(-30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalPop {
          from { transform: scale(0.9) translateY(20px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-modal-pop {
          animation: modalPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .animate-slide-up {
          animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .custom-pin-container {
          filter: none !important;
        }
        .leaflet-container {
          background: #f8f9fa !important;
        }
        .user-pin {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}} />
    </div>
  );
};

export default MapView;

