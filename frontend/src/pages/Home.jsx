import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ParkCard from '../components/ParkCard';
import MapView from '../components/MapView';
import SnapshotPanel from '../components/SnapshotPanel';
import { RiSearchLine, RiFilter3Line, RiMapPinLine } from 'react-icons/ri';
import './Home.css';
import { parkService } from '../services/api';

const Home = () => {
  const [parks, setParks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPark, setSelectedPark] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fallback / Enhancement data (since backend is missing some fields for now)
  const enhanceParkData = (backendParks) => {
    return backendParks.map(park => ({
      ...park,
      // Handle both possible naming conventions from Supabase
      lat: park.latitude || park.lat || 6.5244,
      lng: park.longitude || park.lng || 3.3792,
      name: park.name || "Unnamed Park",
      access: park.access_type || "Public",
      price: park.price || "Free",
      lastUpdated: "Recently",
      description: park.description || `A verified green space in Lagos with a confidence score of ${park.confidence_score || 0}%`
    }));
  };

  useEffect(() => {
    const fetchParks = async () => {
      try {
        setLoading(true);
        const data = await parkService.getAllParks();
        setParks(enhanceParkData(data));
        setLoading(false);
      } catch (err) {
        let errorMsg = "Could not connect to the server. Please ensure the backend is running.";
        if (err.response) {
          errorMsg = `Server error (${err.response.status}): ${err.response.data?.message || err.message}`;
        } else if (err.request) {
          errorMsg = "No response from server. Check your connection or the backend port.";
        }
        setError(errorMsg);
        setLoading(false);
        console.error(err);
      }
    };

    fetchParks();
  }, []);

  return (
    <div className="home">
      <Navbar />
      <main className="main-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Scanning green spaces in Lagos...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="btn-secondary">Retry</button>
          </div>
        ) : (
          <section className="park-explorer">
          <div className="search-bar-container">
            <div className="search-bar glass-morphism">
              <RiSearchLine className="search-icon" />
              <input
                type="text"
                placeholder="Search green spaces in Lagos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="filter-btn"><RiFilter3Line /></button>
            </div>
            <div className="location-info">
              <RiMapPinLine className="pin-icon" />
              <span>Nearby Lagos, Nigeria</span>
            </div>
          </div>

          <div className="explorer-layout">
            <div className="park-list-panel">
              <div className="list-header">
                <h2>Nearby Green Spaces</h2>
                <p>{parks.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).length} results found</p>
              </div>
              <div className="park-cards-grid">
                {parks
                  .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(park => (
                  <ParkCard
                    key={park.id}
                    park={park}
                    isSelected={selectedPark?.id === park.id}
                    onClick={() => setSelectedPark(park)}
                  />
                ))}
              </div>
            </div>

            <div className="map-panel glass-morphism">
              <MapView parks={parks} selectedPark={selectedPark} onMarkerClick={setSelectedPark} />
              
              {selectedPark && (
                <SnapshotPanel 
                  park={selectedPark} 
                  onClose={() => setSelectedPark(null)} 
                />
              )}
            </div>
          </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Home;
